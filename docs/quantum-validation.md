# Interpreting SSPH alongside quantum-chemical validation

An extremum in a relaxed torsional scan is a candidate stationary point, not proof that the unconstrained molecular gradient vanishes. An unconstrained optimization and vibrational analysis classify the geometry; the intrinsic reaction coordinate (IRC), followed by endpoint optimization, identifies which minima the saddle connects. Scan energies and optimized stationary-point energies need not coincide.

| System | Saddle | Connection supported by bidirectional IRC | Event on the sampled torsional profile |
| --- | --- | --- | --- |
| Ethane | Eclipsed | Two symmetry-equivalent representatives of the staggered minimum | Birth of essential H₁ |
| n-Butane | First lateral saddle | anti ↔ gauche+ | Finite H₀ death |
| n-Butane | Second lateral saddle | anti ↔ gauche− | Finite H₀ death |
| n-Butane | syn saddle | gauche+ ↔ gauche− | Birth of essential H₁ |

The sign labels distinguish the two gauche minima on the 360° profile. The two lateral saddles have the same grid threshold at the precision of the supplied data; the persistence intervals do not establish a physical order between the two mergers. The essential H₁ class records closure of the periodic graph, not an IRC path.

The table summarizes the manuscript assignments. Verifying them independently requires the Gaussian optimization, frequency and IRC outputs; those are not yet deposited here.
