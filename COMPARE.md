# How much tinro adds to your bandle?

Current tinro value is **3.45 Kb** (1.29 Kb gzipped) 

## Comparsion

* bundle.js with tinro inside: **27.67 Kb** (8.72 Kb gzipped)
* bundle.js with mocked tinro : **24.21 Kb** (7.44 Kb gzipped)

## How do we compare?

Comparsion made by building [testing app](https://github.com/AlexxNB/tinro/tree/master/tests) in production mode two times. First one with tinro letest version inside. In the second case - all imports from tinro are mocked by empty exports.
    