---
title: Hardware Requirements
description: Find a general evaluation and some example installations in here.
icon: laptop
menu: operations
tags: [operations]
---

The hardware requirements greatly depend on your use case. However, you can find a general evaluation and some example installations below.

## General assessment

We recommend to use the provided Docker containers, so there might be additional overhead for managing the images.

### Application

For high availability, you can place a load balancer in front of multiple instances of both the server and editor.

#### Editor

The Livingdocs Editor's CPU requirements are similar to a small Node.js application. One Editor process requires ~200MB of memory and its disk storage requirements are minimal due to low application footprint.

#### Server

The Livingdocs Server's CPU requirements can be compared to a regular Node.js application. One Server process requires ~500MB of memory. Disk is not an issue since the application footprint is low and uploaded assets are stored in the cloud. You might reach limitations earlier in the Server compared to the Editor. Limitations will depend on the number of users and the tasks performed.
If you expect a lot of traffic on the assets, please consider adding a CDN in your storage solution.

### Databases

The requirements for the databases will depend greatly on the amount of data you want to store and number of transactions done by users and developers. Depending on your requirements, you might want to consider replication strategies for the database.

#### Postgresql

The database requirements are similar to regular Postgres installations. Please refer to [Postgres hardware guide](https://wiki.postgresql.org/wiki/Performance_Optimization) for high performance optimization.

#### Elasticsearch

Elasticsearch is a memory demanding process compared to the rest modules of the stack, but it should not have high CPU usage. Elasticsearch provides a good guide on [Elasticearch's hardware requirements](https://www.elastic.co/guide/en/elasticsearch/guide/master/hardware.html).

### Services

#### Cloud storage

The storage your installation needs is directly coupled to the documents you upload and store. Cloud storage is easily scalable, so you should not expect any troubles here.

## Real life examples

Below you can find an overview of real life installations.

### Minimum requirements

We are running Livingdocs on very basic Amazon S3, DigitalOcean compute instances for demo, staging and development installations. This can be interpreted as the minimum requirements (no high availability and limited performance requirements). The production deployment has the following specifications.

Service | Specs | |
:--- | :--- | ---
**Editor** | Self-hosted Kubernetes Cluster
| | Replicas | 2
**Server** | Self-hosted Kubernetes Cluster
| | Replicas | 2
**Postgres** | DigitalOcean
| | Instance | Droplet
| | vCPU | 4
| | Memory | 8 GB
| | SSD | 160 GB
**Elasticsearch** | DigitalOcean
| | Instance | Droplet
| | vCPU | 2
| | Memory | 4 GB
| | SSD | 80 GB
**Redis** | Self-hosted Kubernetes Cluster
| | Replicas | 1
**Storage** | Amazon S3

Kubernetes cluster specifications:


### Scaled production example

Below you can find an example production setup hosted in AWS without delivery system.

- 400-500 journalists working in the editor
- ~100k documents in the database
- Planning to import 1.6m documents. The import itself is expected to be heavy on the servers, but no massive scaling required for the daily operations
- An external delivery system with Varnish is used to deliver articles to the user
- The system includes development, stage and production environments

The production deployment has the following specifications.

Service | Specs | |
:--- | :--- | ---
**Editor** | Amazon EKS
| | Replicas | 1
**Server** | Amazon EKS
| | Replicas | 5
**Postgres** | Amazon Aurora
| | Instance | 
| | vCPU | 
| | Memory | GB
**Elasticsearch** | Amazon OpenSearch
| | Instance | 
| | vCPU | 
| | Memory | GB
**Redis** | Amazon EKS
| | Replicas | 1
**Storage** | Amazon S3

The whole Livingdocs deployment can be seen in the picture below.

{{< img src="images/lido_example_arch.png" >}}