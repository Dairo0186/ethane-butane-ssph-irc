# Sublevel-set persistent homology and IRC in ethane and n-butane

Reproducibility materials for the manuscript on the relaxed torsional profiles of ethane and n-butane. This repository release candidate reproduces persistence on the supplied energy profiles and documents how to interpret it alongside the quantum-chemical evidence.

## Reproduce the persistence results

From the repository root, run the following command with Node.js (no external dependencies):

```sh
node scripts/analyze-ssph.mjs
```

The script prints JSON; the reference output is in [results/persistence.json](results/persistence.json). The last row in each supplied profile repeats the periodic endpoint and is excluded from the graph. The closing edge connects the last retained vertex to the first. Energies are relative electronic energies in kcal/mol. In the JSON, a `null` death denotes an essential class. Zero-length intervals are not reported.

| System | Step | Periodic vertices | Finite H₀ intervals | H₁ birth (kcal/mol) |
| --- | ---: | ---: | ---: | ---: |
| Ethane | 0.25° | 480 | 0 | 2.73353882 |
| n-Butane | 0.50° | 720 | 2 | 5.45939894 |

Both finite H₀ intervals for n-butane die at 3.26988912 kcal/mol in the supplied grid. Their common threshold alone does not identify the two molecular connections.

## Contents and scope

- [data/](data/): torsional energy profiles underlying the periodic filtration.
- [scripts/](scripts/): dependency-free reimplementation of the one-dimensional lower-star calculation.
- [results/](results/): persistence intervals and discrete profile extrema.
- [docs/quantum-validation.md](docs/quantum-validation.md): stationary-point and IRC assignments, with the evidence each requires.

The repository currently reproduces the persistence calculation. The manuscript figure and its original plotting script, the angular subsampling study, and raw Gaussian input/output files are not included in this version.
