# GrappleTree
Web based Graph DB for BJJ

## Building:
- run: 
```shell
docker compose up
```
- call:
```shell
cd app 
npm run dev 
```
- initialize:
```shell
npm run seed
```

## Running:
- Neo4j runs on port `7474`
- Admin app runs at port `3000`
- Go to `localhost:3000/admin` for the editor app

## Usage:
```cypher
MATCH (n) OPTIONAL MATCH (n)-[r]->(m)
RETURN n, r, m
```
displays the entire graph
