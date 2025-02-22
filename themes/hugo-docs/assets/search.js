const lunr = require('lunr')

const indexes = {}
const byRef = new Map()

function initializeIndex (searchJson) {
	let index
	const queue = []

	fetch(searchJson)
		.then(response => response.json())
		.then((documents) => {
			index = lunr(function () {
				// this.pipeline.remove(lunr.trimmer)

				this.ref('url')
				this.field('title')
				this.field('description')
				this.field('body')
				this.metadataWhitelist = ['position']

				for (const doc of documents) {
					byRef.set(doc.url, doc)
					this.add(doc)
				}
			})

			for (const query of queue) search(query)
		})

	function search (data) {
		if (!index) return queue.push(data)
		try {
			const results = searchInIndex(index, data)
			self.postMessage(JSON.stringify(results))
		} catch (err) {
			console.error('Search error', err)
			self.postMessage('[]')
		}
	}

	const api = {search}
	indexes[searchJson] = api
	return api
}

function searchInIndex (index, {query, filterTags, limit}) {
	const byDoc = {}
	let count = 0
	for (const match of index.query(queryFunction.bind(this, index, query))) {
		count++
		const ref = byRef.get(match.ref)
		const documentUrl = match.ref.replace(/#.+/, '')
		const doc = byRef.get(documentUrl)
		const byField = matchesOfFields(match)

		const url = ref.url
		const title = highlight('title', ref.title, byField)
		const description = highlight('description', ref.description, byField)
		const tags = ref.section ? ref.section.split(',').map((l) => l.trim() ? `<div class="tag tag--spaced">${l.trim()}</div>` : '').join('') : ''

    const passesFilter = ref.section && filterTags ? ref.section.split(',').some(item => filterTags.includes(item)) : false
    
    if (passesFilter) {
      byDoc[documentUrl] = byDoc[documentUrl] || {
        score: 0,
        results: [],
        title: `${tags}${doc.title === ref.title ? '' : `<a href="${documentUrl}" class="search-results-document__title">${doc.title}</a>`}`
      }
  
      byDoc[documentUrl].results.push({url, title, description})
      byDoc[documentUrl].score += match.score
    }
	}

	const results = Object.values(byDoc).sort(function (a, b) { return b.score - a.score }).slice(0, limit)
	for (const doc of results) {
		doc.results = doc.results.slice(0, 3)
	}
	return results
}

function matchesOfFields ({matchData: {metadata}}) {
	const byField = {}
	for (const match in metadata) {
		for (const field in metadata[match]) {
			if (!byField[field]) byField[field] = []
			byField[field].push(...metadata[match][field].position)
		}
	}

	for (const field in byField) {
		byField[field].sort(function (a, b) { return a[0] - b[0] })
	}

	return byField
}

function highlight (prop, string, matches) {
	if (!matches[prop]) return string

	let str = ''
	let offset = 0
	for (const [from, count] of matches[prop]) {
		str += `${string.substring(offset, from)}<em>${string.substr(from, count)}</em>`
		offset = from + count
	}
	str += string.substr(offset)
	return str
}

function queryFunction (index, query, q) {
	const words = query.toLowerCase().split(/[ .]/).filter(Boolean)

	// how to properly normalize the string?
	const segments = words.map((k) => index.pipeline.runString(k)[0])

	q.term(words, {
		usePipeline: true,
		editDistance: 1,
		boost: 50,
		fields: ['title', 'description'],
		wildcard: lunr.Query.wildcard.TRAILING
	})

	q.term(segments, {
		fields: ['title', 'description', 'body'],
		boost: 5,
		editDistance: 0,
		usePipeline: false
	})

  new lunr.QueryParser(query, q).parse()
}

self.addEventListener('message', function (e) {
	const data = JSON.parse(e.data);
	(indexes[data.index] || initializeIndex(data.index))
		.search(data)
}, false)
