# How much tinro adds to your bandle?

Current tinro value is **1.66 Kb** (0.59 Kb gzipped) 

## Comparsion

* bundle.js with tinro inside: **24.68 Kb** (7.92 Kb gzipped)
* bundle.js with mocked tinro : **23.02 Kb** (7.32 Kb gzipped)

## How do we compare?

Comparsion made by building [testing app](https://github.com/AlexxNB/tinro/tree/master/tests) in production mode two times. First one with tinro letest version inside. In the second case - all imports from tinro are mocked by empty exports.
    