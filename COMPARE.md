# How much does tinro add to your bundle?

Current tinro size is **3.45 Kb** (1.29 Kb gzipped) 

## Comparsion

* bundle.js with tinro inside: **27.67 Kb** (8.72 Kb gzipped)
* bundle.js with mocked tinro: **24.21 Kb** (7.44 Kb gzipped)

## How do we compare?

The comparsion is made by building the [testing app](https://github.com/AlexxNB/tinro/tree/master/tests) in production mode two times. The first one has the latest version of tinro, and the second one has all imports from tinro mocked by empty exports.
    