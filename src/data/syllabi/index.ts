export type PreloadedChapter = {
  chapter_number: number;
  chapter_name: string;
  topics: string[];
  weightage: "high" | "medium" | "low";
};

export type PreloadedSubject = {
  subject: string;
  chapters: PreloadedChapter[];
};

type RawChapter = [name: string, topics: string[], w?: "high" | "medium" | "low"];

function build(subject: string, raw: RawChapter[]): PreloadedSubject {
  return {
    subject,
    chapters: raw.map(([chapter_name, topics, w], i) => ({
      chapter_number: i + 1,
      chapter_name,
      topics,
      weightage: w ?? "medium",
    })),
  };
}

// ---------------- JEE / NEET shared ----------------
const JEE_PHYSICS = build("Physics", [
  ["Units and Dimensions", ["SI units", "Dimensional analysis", "Significant figures", "Errors in measurement"], "low"],
  ["Motion in a Straight Line", ["Displacement & velocity", "Acceleration", "Kinematic equations", "Graphical analysis"], "medium"],
  ["Motion in a Plane", ["Vectors", "Projectile motion", "Uniform circular motion", "Relative velocity"], "medium"],
  ["Laws of Motion", ["Newton's laws", "Friction", "Tension & normal force", "Pseudo forces", "Equilibrium"], "high"],
  ["Work Energy and Power", ["Work done by variable force", "Kinetic & potential energy", "Conservation of energy", "Power", "Collisions"], "high"],
  ["System of Particles and Rotational Motion", ["Centre of mass", "Torque", "Angular momentum", "Moment of inertia", "Rolling motion"], "high"],
  ["Gravitation", ["Kepler's laws", "Gravitational potential", "Satellites", "Escape velocity"], "medium"],
  ["Mechanical Properties of Solids", ["Stress & strain", "Hooke's law", "Young's modulus", "Bulk & shear modulus"], "low"],
  ["Mechanical Properties of Fluids", ["Pascal's law", "Bernoulli's principle", "Viscosity", "Surface tension"], "medium"],
  ["Thermal Properties of Matter", ["Thermal expansion", "Specific heat", "Calorimetry", "Heat transfer"], "medium"],
  ["Thermodynamics", ["Zeroth & first law", "Second law", "Carnot engine", "Entropy", "Thermodynamic processes"], "high"],
  ["Kinetic Theory of Gases", ["Ideal gas equation", "RMS speed", "Degrees of freedom", "Mean free path"], "medium"],
  ["Oscillations", ["SHM", "Energy in SHM", "Simple pendulum", "Damped & forced oscillations"], "high"],
  ["Waves", ["Wave equation", "Superposition", "Standing waves", "Beats", "Doppler effect"], "high"],
  ["Electric Charges and Fields", ["Coulomb's law", "Electric field", "Gauss's law", "Electric dipole"], "high"],
  ["Electrostatic Potential and Capacitance", ["Potential difference", "Equipotential surfaces", "Capacitors", "Dielectrics"], "high"],
  ["Current Electricity", ["Ohm's law", "Kirchhoff's laws", "Wheatstone bridge", "Drift velocity", "Cells & EMF"], "high"],
  ["Moving Charges and Magnetism", ["Biot-Savart law", "Ampere's law", "Force on current carrying wire", "Cyclotron"], "high"],
  ["Magnetism and Matter", ["Bar magnet", "Earth's magnetism", "Magnetic materials"], "low"],
  ["Electromagnetic Induction", ["Faraday's law", "Lenz's law", "Self & mutual inductance", "Eddy currents"], "high"],
  ["Alternating Current", ["AC circuits", "Resonance", "LCR series", "Transformer"], "high"],
  ["Electromagnetic Waves", ["Maxwell's equations", "EM spectrum", "Properties of EM waves"], "low"],
  ["Ray Optics", ["Reflection & refraction", "Lenses & mirrors", "Total internal reflection", "Optical instruments"], "high"],
  ["Wave Optics", ["Interference", "Young's double slit", "Diffraction", "Polarisation"], "high"],
  ["Dual Nature of Radiation and Matter", ["Photoelectric effect", "De Broglie wavelength", "Davisson-Germer experiment"], "medium"],
  ["Atoms", ["Rutherford model", "Bohr model", "Hydrogen spectrum"], "medium"],
  ["Nuclei", ["Nuclear binding energy", "Radioactive decay", "Fission & fusion"], "medium"],
  ["Semiconductor Electronics", ["p-n junction", "Diode", "Transistor", "Logic gates"], "high"],
]);

const JEE_CHEM = build("Chemistry", [
  ["Some Basic Concepts of Chemistry", ["Mole concept", "Stoichiometry", "Empirical & molecular formula", "Concentration units"], "medium"],
  ["Structure of Atom", ["Bohr model", "Quantum numbers", "Aufbau principle", "Heisenberg principle"], "high"],
  ["Classification of Elements", ["Modern periodic law", "Periodic trends", "Ionisation enthalpy", "Electronegativity"], "medium"],
  ["Chemical Bonding", ["Ionic & covalent bond", "VSEPR theory", "Hybridisation", "MO theory", "Hydrogen bonding"], "high"],
  ["States of Matter", ["Gas laws", "Ideal gas equation", "Liquefaction", "Intermolecular forces"], "low"],
  ["Thermodynamics", ["First law", "Enthalpy", "Hess's law", "Gibbs free energy", "Entropy"], "high"],
  ["Equilibrium", ["Le Chatelier's principle", "Kp & Kc", "Ionic equilibrium", "Buffer solutions", "Solubility product"], "high"],
  ["Redox Reactions", ["Oxidation number", "Balancing redox", "Electrochemical series"], "medium"],
  ["Hydrogen", ["Position in periodic table", "Hydrides", "Water", "Hydrogen peroxide"], "low"],
  ["s-Block Elements", ["Alkali metals", "Alkaline earth metals", "Important compounds"], "low"],
  ["p-Block Elements", ["Group 13-18 elements", "Allotropes", "Oxides & oxoacids", "Anomalous behaviour"], "medium"],
  ["Organic Chemistry Basic Principles", ["IUPAC nomenclature", "Isomerism", "Inductive & resonance effects", "Reaction mechanisms"], "high"],
  ["Hydrocarbons", ["Alkanes alkenes alkynes", "Aromatic compounds", "Markovnikov rule", "Substitution & addition"], "high"],
  ["Environmental Chemistry", ["Atmospheric pollution", "Water pollution", "Green chemistry"], "low"],
  ["Solid State", ["Crystal lattices", "Unit cells", "Packing efficiency", "Defects"], "medium"],
  ["Solutions", ["Concentration", "Raoult's law", "Colligative properties", "Van't Hoff factor"], "high"],
  ["Electrochemistry", ["Galvanic cells", "Nernst equation", "Conductance", "Electrolysis", "Batteries"], "high"],
  ["Chemical Kinetics", ["Rate law", "Order & molecularity", "Arrhenius equation", "Half life"], "high"],
  ["Surface Chemistry", ["Adsorption", "Catalysis", "Colloids", "Emulsions"], "low"],
  ["General Principles of Isolation of Elements", ["Ores & minerals", "Concentration methods", "Reduction", "Refining"], "low"],
  ["d and f Block Elements", ["Transition metals", "Properties", "Lanthanoid contraction", "Actinoids"], "medium"],
  ["Coordination Compounds", ["Werner's theory", "Nomenclature", "Isomerism", "Crystal field theory", "Bonding"], "high"],
  ["Haloalkanes and Haloarenes", ["Preparation & properties", "SN1 SN2 reactions", "Grignard reagents"], "high"],
  ["Alcohols Phenols and Ethers", ["Preparation", "Reactions", "Acidity of phenols", "Williamson synthesis"], "high"],
  ["Aldehydes Ketones and Carboxylic Acids", ["Preparation", "Nucleophilic addition", "Aldol & Cannizzaro", "Acidity"], "high"],
  ["Amines", ["Classification", "Preparation", "Basicity", "Diazonium salts"], "medium"],
  ["Biomolecules", ["Carbohydrates", "Proteins", "Nucleic acids", "Vitamins"], "medium"],
  ["Polymers", ["Classification", "Addition & condensation polymerisation", "Biodegradable polymers"], "low"],
  ["Chemistry in Everyday Life", ["Drugs", "Soaps & detergents", "Food additives"], "low"],
]);

const JEE_MATH = build("Mathematics", [
  ["Sets Relations and Functions", ["Set operations", "Relations", "Functions & their types", "Composition & inverse"], "medium"],
  ["Complex Numbers", ["Algebra of complex numbers", "Modulus & argument", "De Moivre's theorem", "Roots of unity"], "high"],
  ["Matrices and Determinants", ["Operations on matrices", "Inverse", "Determinant properties", "System of equations"], "high"],
  ["Permutations and Combinations", ["Fundamental principle", "nPr, nCr", "Circular permutations", "Distributions"], "medium"],
  ["Mathematical Induction", ["Principle of induction", "Applications"], "low"],
  ["Binomial Theorem", ["Expansion", "General term", "Middle term", "Properties of coefficients"], "high"],
  ["Sequences and Series", ["AP, GP, HP", "Sum to n terms", "AM-GM-HM inequality"], "medium"],
  ["Limits Continuity and Differentiability", ["Limits", "Continuity", "Differentiability", "Rolle's & Mean Value theorem"], "high"],
  ["Integral Calculus", ["Indefinite integrals", "Definite integrals", "Properties", "Area under curves"], "high"],
  ["Differential Equations", ["Order & degree", "Variable separable", "Linear DE", "Homogeneous DE"], "high"],
  ["Coordinate Geometry", ["Straight lines", "Circles", "Parabola", "Ellipse", "Hyperbola"], "high"],
  ["Three Dimensional Geometry", ["Direction cosines", "Line in 3D", "Plane equation", "Shortest distance"], "high"],
  ["Vector Algebra", ["Addition & scalar multiplication", "Dot & cross product", "Scalar triple product"], "high"],
  ["Statistics and Probability", ["Mean median mode", "Variance", "Probability rules", "Bayes' theorem", "Binomial distribution"], "high"],
  ["Trigonometry", ["Trigonometric identities", "Equations", "Inverse functions", "Heights & distances"], "high"],
  ["Mathematical Reasoning", ["Statements", "Logical connectives", "Tautology & contradiction"], "low"],
]);

const NEET_BIO = build("Biology", [
  ["The Living World", ["Diversity", "Taxonomy", "Binomial nomenclature"], "low"],
  ["Biological Classification", ["Five kingdom classification", "Monera Protista Fungi", "Viruses & lichens"], "medium"],
  ["Plant Kingdom", ["Algae", "Bryophyta", "Pteridophyta", "Gymnosperms", "Angiosperms"], "medium"],
  ["Animal Kingdom", ["Levels of organisation", "Phyla of non-chordates", "Chordates"], "high"],
  ["Morphology of Flowering Plants", ["Root stem leaf", "Inflorescence", "Flower fruit seed", "Floral formula"], "medium"],
  ["Anatomy of Flowering Plants", ["Tissues", "Tissue systems", "Secondary growth"], "medium"],
  ["Structural Organisation in Animals", ["Animal tissues", "Cockroach", "Frog"], "low"],
  ["Cell The Unit of Life", ["Cell theory", "Prokaryotic & eukaryotic cell", "Cell organelles"], "high"],
  ["Biomolecules", ["Carbohydrates", "Proteins", "Lipids", "Enzymes", "Nucleic acids"], "high"],
  ["Cell Cycle and Cell Division", ["Mitosis", "Meiosis", "Significance of cell division"], "high"],
  ["Transport in Plants", ["Diffusion & osmosis", "Water absorption", "Transpiration", "Phloem transport"], "medium"],
  ["Mineral Nutrition", ["Essential nutrients", "Deficiency symptoms", "Nitrogen cycle"], "low"],
  ["Photosynthesis in Higher Plants", ["Light & dark reaction", "C3 C4 pathway", "Photorespiration"], "high"],
  ["Respiration in Plants", ["Glycolysis", "Krebs cycle", "ETS", "Fermentation"], "high"],
  ["Plant Growth and Development", ["Phases of growth", "Plant hormones", "Photoperiodism"], "medium"],
  ["Digestion and Absorption", ["Digestive system", "Digestion of food", "Absorption", "Disorders"], "medium"],
  ["Breathing and Exchange of Gases", ["Respiratory organs", "Mechanism of breathing", "Transport of gases"], "medium"],
  ["Body Fluids and Circulation", ["Blood composition", "Heart structure", "Cardiac cycle", "ECG"], "high"],
  ["Excretory Products and their Elimination", ["Kidney structure", "Urine formation", "Regulation"], "medium"],
  ["Locomotion and Movement", ["Muscles", "Skeletal system", "Joints", "Muscle contraction"], "medium"],
  ["Neural Control and Coordination", ["Neuron", "Nerve impulse", "Brain & spinal cord", "Reflex action"], "high"],
  ["Chemical Coordination and Integration", ["Endocrine glands", "Hormones of pituitary & thyroid", "Pancreas hormones"], "high"],
  ["Reproduction in Organisms", ["Asexual reproduction", "Sexual reproduction", "Life span"], "low"],
  ["Sexual Reproduction in Flowering Plants", ["Flower structure", "Pollination", "Double fertilisation", "Apomixis"], "high"],
  ["Human Reproduction", ["Male & female reproductive system", "Gametogenesis", "Menstrual cycle", "Pregnancy"], "high"],
  ["Reproductive Health", ["Contraception", "STDs", "Infertility", "MTP"], "medium"],
  ["Principles of Inheritance and Variation", ["Mendel's laws", "Chromosomal theory", "Linkage", "Sex determination", "Genetic disorders"], "high"],
  ["Molecular Basis of Inheritance", ["DNA structure", "Replication", "Transcription", "Translation", "Genetic code"], "high"],
  ["Evolution", ["Theories of evolution", "Hardy-Weinberg principle", "Human evolution"], "medium"],
  ["Human Health and Disease", ["Pathogens", "Immunity", "AIDS & cancer", "Drugs & alcohol abuse"], "high"],
  ["Strategies for Enhancement in Food Production", ["Plant breeding", "Animal husbandry", "Tissue culture"], "low"],
  ["Microbes in Human Welfare", ["Microbes in food", "Industrial products", "Sewage treatment", "Biocontrol"], "medium"],
  ["Biotechnology Principles and Processes", ["Recombinant DNA", "Restriction enzymes", "PCR", "Bioreactors"], "high"],
  ["Biotechnology and its Applications", ["GM crops", "Bt cotton", "Gene therapy", "Molecular diagnostics"], "high"],
  ["Organisms and Populations", ["Population attributes", "Population interactions", "Adaptations"], "medium"],
  ["Ecosystem", ["Components", "Productivity", "Energy flow", "Nutrient cycles"], "medium"],
  ["Biodiversity and Conservation", ["Levels of biodiversity", "Hotspots", "Conservation strategies"], "medium"],
  ["Environmental Issues", ["Air & water pollution", "Solid waste", "Climate change", "Ozone depletion"], "low"],
]);

// ---------------- CBSE Grade 12 ----------------
const CBSE12_PHY: PreloadedSubject = JEE_PHYSICS;
const CBSE12_CHEM: PreloadedSubject = JEE_CHEM;
const CBSE12_MATH = build("Mathematics", [
  ["Relations and Functions", ["Types of relations", "Types of functions", "Composite functions", "Inverse functions"], "medium"],
  ["Inverse Trigonometric Functions", ["Definitions", "Properties", "Principal value branches"], "medium"],
  ["Matrices", ["Operations", "Transpose", "Symmetric & skew-symmetric", "Elementary operations"], "high"],
  ["Determinants", ["Properties", "Minors & cofactors", "Adjoint & inverse", "Applications to equations"], "high"],
  ["Continuity and Differentiability", ["Continuity", "Differentiability", "Logarithmic differentiation", "Mean value theorem"], "high"],
  ["Application of Derivatives", ["Rate of change", "Increasing decreasing", "Tangents & normals", "Maxima & minima"], "high"],
  ["Integrals", ["Indefinite integrals", "Methods of integration", "Definite integrals", "Properties"], "high"],
  ["Application of Integrals", ["Area under curves", "Area between two curves"], "medium"],
  ["Differential Equations", ["Order & degree", "Variable separable", "Linear DE", "Homogeneous DE"], "high"],
  ["Vector Algebra", ["Types of vectors", "Dot product", "Cross product", "Scalar triple product"], "high"],
  ["Three Dimensional Geometry", ["Direction cosines", "Line equations", "Plane equations", "Shortest distance"], "high"],
  ["Linear Programming", ["Mathematical formulation", "Graphical method", "Feasible region"], "medium"],
  ["Probability", ["Conditional probability", "Bayes' theorem", "Random variables", "Bernoulli trials"], "high"],
]);
const CBSE12_BIO: PreloadedSubject = build("Biology", [
  ["Reproduction in Organisms", ["Modes of reproduction", "Asexual reproduction", "Sexual reproduction"], "low"],
  ["Sexual Reproduction in Flowering Plants", ["Flower structure", "Pollination", "Double fertilisation"], "high"],
  ["Human Reproduction", ["Male & female reproductive system", "Gametogenesis", "Menstrual cycle"], "high"],
  ["Reproductive Health", ["Contraception", "STDs", "MTP"], "medium"],
  ["Principles of Inheritance and Variation", ["Mendel's laws", "Linkage", "Sex determination"], "high"],
  ["Molecular Basis of Inheritance", ["DNA structure", "Replication", "Transcription", "Translation"], "high"],
  ["Evolution", ["Theories", "Hardy-Weinberg", "Human evolution"], "medium"],
  ["Human Health and Disease", ["Pathogens", "Immunity", "Drugs & alcohol"], "high"],
  ["Microbes in Human Welfare", ["Microbes in food", "Sewage", "Biocontrol"], "medium"],
  ["Biotechnology Principles and Processes", ["rDNA", "PCR", "Bioreactors"], "high"],
  ["Biotechnology and its Applications", ["GM crops", "Gene therapy", "Molecular diagnostics"], "high"],
  ["Organisms and Populations", ["Population attributes", "Interactions"], "medium"],
  ["Ecosystem", ["Productivity", "Energy flow", "Nutrient cycles"], "medium"],
  ["Biodiversity and Conservation", ["Levels", "Hotspots", "Conservation"], "medium"],
  ["Environmental Issues", ["Pollution", "Climate change", "Ozone depletion"], "low"],
]);

// ---------------- CBSE Grade 11 ----------------
const CBSE11_PHY = build("Physics", [
  ["Physical World and Measurement", ["Units", "Dimensional analysis", "Errors"], "low"],
  ["Kinematics", ["Motion in a straight line", "Motion in a plane", "Projectile motion"], "high"],
  ["Laws of Motion", ["Newton's laws", "Friction", "Circular motion"], "high"],
  ["Work Energy and Power", ["Work done", "Energy", "Collisions"], "high"],
  ["Motion of System of Particles and Rotational Motion", ["Centre of mass", "Torque", "Moment of inertia"], "high"],
  ["Gravitation", ["Kepler's laws", "Gravitational potential", "Escape velocity"], "medium"],
  ["Properties of Bulk Matter", ["Elasticity", "Fluid mechanics", "Surface tension"], "medium"],
  ["Thermodynamics", ["Laws of thermodynamics", "Carnot engine", "Entropy"], "high"],
  ["Behaviour of Perfect Gas and Kinetic Theory", ["Ideal gas equation", "RMS speed", "Degrees of freedom"], "medium"],
  ["Oscillations and Waves", ["SHM", "Wave motion", "Doppler effect"], "high"],
]);
const CBSE11_CHEM = build("Chemistry", [
  ["Some Basic Concepts of Chemistry", ["Mole concept", "Stoichiometry"], "medium"],
  ["Structure of Atom", ["Bohr model", "Quantum numbers"], "high"],
  ["Classification of Elements and Periodicity", ["Modern periodic law", "Periodic trends"], "medium"],
  ["Chemical Bonding and Molecular Structure", ["VSEPR", "Hybridisation", "MO theory"], "high"],
  ["States of Matter", ["Gas laws", "Liquefaction"], "low"],
  ["Thermodynamics", ["First law", "Hess's law", "Gibbs energy"], "high"],
  ["Equilibrium", ["Chemical equilibrium", "Ionic equilibrium", "Buffer"], "high"],
  ["Redox Reactions", ["Oxidation number", "Balancing"], "medium"],
  ["Hydrogen", ["Hydrides", "Water", "H2O2"], "low"],
  ["s-Block Elements", ["Alkali metals", "Alkaline earth metals"], "low"],
  ["p-Block Elements", ["Group 13 & 14", "Allotropes"], "medium"],
  ["Organic Chemistry Some Basic Principles and Techniques", ["IUPAC", "Isomerism", "Reaction mechanisms"], "high"],
  ["Hydrocarbons", ["Alkanes alkenes alkynes", "Aromatic"], "high"],
  ["Environmental Chemistry", ["Pollution", "Green chemistry"], "low"],
]);
const CBSE11_MATH = build("Mathematics", [
  ["Sets", ["Set operations", "Venn diagrams"], "medium"],
  ["Relations and Functions", ["Cartesian product", "Functions"], "medium"],
  ["Trigonometric Functions", ["Trig identities", "Equations"], "high"],
  ["Principle of Mathematical Induction", ["Induction proofs"], "low"],
  ["Complex Numbers and Quadratic Equations", ["Algebra of complex numbers", "Quadratic equations"], "high"],
  ["Linear Inequalities", ["Solving inequalities", "Graphical solutions"], "low"],
  ["Permutations and Combinations", ["nPr nCr", "Distributions"], "medium"],
  ["Binomial Theorem", ["Expansion", "General term"], "high"],
  ["Sequence and Series", ["AP GP HP", "Sum to n terms"], "medium"],
  ["Straight Lines", ["Slope", "Various forms", "Distance"], "high"],
  ["Conic Sections", ["Circle", "Parabola", "Ellipse", "Hyperbola"], "high"],
  ["Introduction to Three Dimensional Geometry", ["Coordinate axes", "Distance formula"], "medium"],
  ["Limits and Derivatives", ["Limits", "Derivatives"], "high"],
  ["Mathematical Reasoning", ["Statements", "Logical operators"], "low"],
  ["Statistics", ["Mean median mode", "Variance"], "medium"],
  ["Probability", ["Events", "Axiomatic probability"], "high"],
]);
const CBSE11_BIO = build("Biology", [
  ["The Living World", ["Diversity", "Taxonomy"], "low"],
  ["Biological Classification", ["Five kingdoms", "Viruses & lichens"], "medium"],
  ["Plant Kingdom", ["Algae to angiosperms"], "medium"],
  ["Animal Kingdom", ["Non-chordates & chordates"], "high"],
  ["Morphology of Flowering Plants", ["Root stem leaf", "Flower fruit seed"], "medium"],
  ["Anatomy of Flowering Plants", ["Tissue systems", "Secondary growth"], "medium"],
  ["Structural Organisation in Animals", ["Animal tissues", "Earthworm cockroach frog"], "low"],
  ["Cell The Unit of Life", ["Cell theory", "Organelles"], "high"],
  ["Biomolecules", ["Carbohydrates proteins lipids", "Enzymes"], "high"],
  ["Cell Cycle and Cell Division", ["Mitosis", "Meiosis"], "high"],
  ["Transport in Plants", ["Diffusion osmosis", "Transpiration"], "medium"],
  ["Mineral Nutrition", ["Essential elements", "Nitrogen cycle"], "low"],
  ["Photosynthesis", ["Light & dark reaction", "C3 C4"], "high"],
  ["Respiration in Plants", ["Glycolysis", "Krebs cycle"], "high"],
  ["Plant Growth and Development", ["Hormones", "Photoperiodism"], "medium"],
  ["Digestion and Absorption", ["Digestive system", "Absorption"], "medium"],
  ["Breathing and Exchange of Gases", ["Respiratory system", "Transport of gases"], "medium"],
  ["Body Fluids and Circulation", ["Blood", "Heart", "Cardiac cycle"], "high"],
  ["Excretory Products and Their Elimination", ["Kidney", "Urine formation"], "medium"],
  ["Locomotion and Movement", ["Skeletal system", "Muscle contraction"], "medium"],
  ["Neural Control and Coordination", ["Neuron", "Brain", "Reflex"], "high"],
  ["Chemical Coordination and Integration", ["Endocrine glands", "Hormones"], "high"],
]);

// ---------------- CBSE Grade 10 ----------------
const CBSE10_SCIENCE = build("Science", [
  ["Chemical Reactions and Equations", ["Types of reactions", "Balancing equations", "Oxidation & reduction"], "high"],
  ["Acids Bases and Salts", ["pH scale", "Reactions of acids & bases", "Common salts"], "high"],
  ["Metals and Non-metals", ["Properties", "Reactivity series", "Extraction of metals", "Corrosion"], "high"],
  ["Carbon and its Compounds", ["Covalent bonding", "Allotropes", "Functional groups", "Soaps & detergents"], "high"],
  ["Life Processes", ["Nutrition", "Respiration", "Transportation", "Excretion"], "high"],
  ["Control and Coordination", ["Nervous system", "Hormones in animals & plants"], "high"],
  ["How Do Organisms Reproduce", ["Asexual reproduction", "Sexual reproduction", "Reproductive health"], "high"],
  ["Heredity and Evolution", ["Mendel's experiments", "Evolution", "Speciation"], "medium"],
  ["Light Reflection and Refraction", ["Mirrors", "Lenses", "Mirror & lens formulae", "Power of lens"], "high"],
  ["Human Eye and Colourful World", ["Defects of vision", "Dispersion", "Atmospheric refraction"], "medium"],
  ["Electricity", ["Ohm's law", "Resistance", "Heating effect", "Power"], "high"],
  ["Magnetic Effects of Electric Current", ["Magnetic field", "Solenoid", "Electric motor & generator"], "high"],
  ["Our Environment", ["Ecosystem", "Food chains", "Ozone depletion"], "low"],
]);
const CBSE10_MATH = build("Mathematics", [
  ["Real Numbers", ["Euclid's algorithm", "Fundamental theorem of arithmetic", "Irrational numbers"], "medium"],
  ["Polynomials", ["Zeros of polynomials", "Division algorithm"], "medium"],
  ["Pair of Linear Equations in Two Variables", ["Graphical method", "Substitution", "Elimination", "Cross multiplication"], "high"],
  ["Quadratic Equations", ["Solution by factorisation", "Quadratic formula", "Nature of roots"], "high"],
  ["Arithmetic Progressions", ["nth term", "Sum to n terms"], "high"],
  ["Triangles", ["Similarity", "Pythagoras theorem", "Areas of similar triangles"], "high"],
  ["Coordinate Geometry", ["Distance formula", "Section formula", "Area of triangle"], "high"],
  ["Introduction to Trigonometry", ["Trig ratios", "Trig identities"], "high"],
  ["Some Applications of Trigonometry", ["Heights & distances"], "medium"],
  ["Circles", ["Tangent to a circle", "Number of tangents"], "medium"],
  ["Constructions", ["Division of line segment", "Tangents to circle"], "low"],
  ["Areas Related to Circles", ["Area of sector & segment", "Combinations of figures"], "medium"],
  ["Surface Areas and Volumes", ["Combination of solids", "Frustum"], "high"],
  ["Statistics", ["Mean median mode of grouped data", "Cumulative frequency"], "high"],
  ["Probability", ["Classical probability", "Simple problems"], "medium"],
]);
const CBSE10_SST = build("Social Science", [
  ["The Rise of Nationalism in Europe", ["French Revolution", "Unification of Germany & Italy"], "medium"],
  ["Nationalism in India", ["Non-cooperation movement", "Civil disobedience", "Quit India movement"], "high"],
  ["The Making of a Global World", ["Pre-modern globalisation", "Inter-war economy"], "medium"],
  ["The Age of Industrialisation", ["Industrial Revolution", "Indian industries"], "medium"],
  ["Print Culture and the Modern World", ["Print revolution", "Print in India"], "low"],
  ["Resources and Development", ["Types of resources", "Land & soil resources"], "medium"],
  ["Forest and Wildlife Resources", ["Conservation", "Project Tiger"], "low"],
  ["Water Resources", ["Multipurpose projects", "Rainwater harvesting"], "medium"],
  ["Agriculture", ["Cropping patterns", "Major crops"], "medium"],
  ["Minerals and Energy Resources", ["Types of minerals", "Conventional & non-conventional energy"], "medium"],
  ["Manufacturing Industries", ["Types of industries", "Industrial pollution"], "medium"],
  ["Lifelines of National Economy", ["Transport", "Communication", "Trade"], "medium"],
  ["Power Sharing", ["Belgium & Sri Lanka", "Forms of power sharing"], "medium"],
  ["Federalism", ["Indian federalism", "Decentralisation"], "high"],
  ["Gender Religion and Caste", ["Social divisions", "Communalism"], "medium"],
  ["Political Parties", ["National & regional parties", "Challenges"], "high"],
  ["Outcomes of Democracy", ["Accountable government", "Economic outcomes"], "medium"],
  ["Development", ["National income", "Human Development Index"], "high"],
  ["Sectors of the Indian Economy", ["Primary secondary tertiary", "Organised & unorganised"], "high"],
  ["Money and Credit", ["Modern forms of money", "Formal & informal credit"], "high"],
  ["Globalisation and the Indian Economy", ["MNCs", "Foreign trade", "WTO"], "medium"],
  ["Consumer Rights", ["Consumer movement", "Consumer protection"], "medium"],
]);
const CBSE10_ENG = build("English", [
  ["A Letter to God", ["Theme", "Character analysis", "Summary"], "medium"],
  ["Nelson Mandela Long Walk to Freedom", ["Apartheid", "Inauguration", "Themes"], "high"],
  ["Two Stories About Flying", ["His First Flight", "Black Aeroplane"], "medium"],
  ["From the Diary of Anne Frank", ["Anne's life", "Themes"], "medium"],
  ["The Hundred Dresses", ["Plot", "Characters", "Theme"], "medium"],
  ["Glimpses of India", ["A Baker from Goa", "Coorg", "Tea from Assam"], "medium"],
  ["Mijbil the Otter", ["Plot summary", "Theme"], "low"],
  ["Madam Rides the Bus", ["Plot", "Characters"], "low"],
  ["The Sermon at Benares", ["Buddha's teachings"], "medium"],
  ["The Proposal", ["Plot", "Characters", "Humour"], "high"],
  ["Grammar", ["Tenses", "Modals", "Voice", "Narration", "Subject-verb agreement"], "high"],
  ["Writing Skills", ["Letter writing", "Article writing", "Analytical paragraph"], "high"],
]);

// ---------------- CBSE Grade 9 ----------------
const CBSE9_SCIENCE = build("Science", [
  ["Matter in Our Surroundings", ["States of matter", "Change of state", "Evaporation"], "medium"],
  ["Is Matter Around Us Pure", ["Mixtures", "Solutions", "Separation techniques"], "medium"],
  ["Atoms and Molecules", ["Laws of chemical combination", "Mole concept"], "high"],
  ["Structure of the Atom", ["Sub-atomic particles", "Bohr model", "Isotopes & isobars"], "high"],
  ["The Fundamental Unit of Life", ["Cell structure", "Cell organelles"], "high"],
  ["Tissues", ["Plant & animal tissues"], "medium"],
  ["Motion", ["Distance & displacement", "Equations of motion", "Graphical representation"], "high"],
  ["Force and Laws of Motion", ["Newton's laws", "Momentum"], "high"],
  ["Gravitation", ["Universal law of gravitation", "Free fall", "Thrust & pressure"], "high"],
  ["Work and Energy", ["Work", "Kinetic & potential energy", "Power"], "high"],
  ["Sound", ["Production & propagation", "Reflection", "Range of hearing"], "medium"],
  ["Improvement in Food Resources", ["Crop production", "Animal husbandry"], "low"],
]);
const CBSE9_MATH = build("Mathematics", [
  ["Number Systems", ["Rational & irrational numbers", "Real numbers on number line", "Laws of exponents"], "high"],
  ["Polynomials", ["Zeros of polynomial", "Remainder & factor theorem"], "high"],
  ["Coordinate Geometry", ["Cartesian plane", "Plotting points"], "medium"],
  ["Linear Equations in Two Variables", ["Solutions", "Graphical representation"], "medium"],
  ["Introduction to Euclid's Geometry", ["Axioms & postulates"], "low"],
  ["Lines and Angles", ["Pairs of angles", "Parallel lines", "Angle sum property"], "medium"],
  ["Triangles", ["Congruence", "Properties", "Inequalities"], "high"],
  ["Quadrilaterals", ["Properties", "Mid-point theorem"], "high"],
  ["Areas of Parallelograms and Triangles", ["Same base & parallels"], "medium"],
  ["Circles", ["Chords", "Cyclic quadrilateral"], "medium"],
  ["Constructions", ["Bisectors", "Triangles"], "low"],
  ["Heron's Formula", ["Area of triangle", "Application to quadrilaterals"], "medium"],
  ["Surface Areas and Volumes", ["Cube cuboid cylinder cone sphere"], "high"],
  ["Statistics", ["Data collection", "Graphical representation", "Measures of central tendency"], "high"],
  ["Probability", ["Empirical probability"], "low"],
]);
const CBSE9_SST = build("Social Science", [
  ["The French Revolution", ["Causes", "Reign of Terror", "Outcomes"], "high"],
  ["Socialism in Europe and the Russian Revolution", ["Russian Revolution", "Soviet Union"], "medium"],
  ["Nazism and the Rise of Hitler", ["Weimar Republic", "Nazi ideology", "Holocaust"], "high"],
  ["Forest Society and Colonialism", ["Deforestation", "Forest Acts"], "low"],
  ["Pastoralists in the Modern World", ["Pastoral nomads", "Colonial restrictions"], "low"],
  ["India Size and Location", ["Location", "Latitudinal extent"], "medium"],
  ["Physical Features of India", ["Major physiographic divisions"], "medium"],
  ["Drainage", ["Himalayan & Peninsular rivers"], "medium"],
  ["Climate", ["Monsoon", "Climate controls"], "high"],
  ["Natural Vegetation and Wildlife", ["Types of vegetation", "Wildlife reserves"], "low"],
  ["Population", ["Distribution", "Composition", "Adolescent health"], "medium"],
  ["What is Democracy Why Democracy", ["Features of democracy"], "medium"],
  ["Constitutional Design", ["Indian Constitution", "Preamble"], "high"],
  ["Electoral Politics", ["Elections in India", "Election Commission"], "high"],
  ["Working of Institutions", ["Parliament", "Executive", "Judiciary"], "high"],
  ["Democratic Rights", ["Fundamental rights"], "high"],
  ["The Story of Village Palampur", ["Production", "Factors of production"], "medium"],
  ["People as Resource", ["Human capital", "Quality of population"], "medium"],
  ["Poverty as a Challenge", ["Poverty line", "Anti-poverty measures"], "high"],
  ["Food Security in India", ["PDS", "Buffer stock"], "medium"],
]);
const CBSE9_ENG = build("English", [
  ["The Fun They Had", ["Plot", "Theme of education"], "medium"],
  ["The Sound of Music", ["Evelyn Glennie", "Bismillah Khan"], "medium"],
  ["The Little Girl", ["Father-daughter relationship", "Theme"], "low"],
  ["A Truly Beautiful Mind", ["Albert Einstein's life"], "medium"],
  ["The Snake and the Mirror", ["Plot", "Humour & irony"], "low"],
  ["My Childhood", ["APJ Abdul Kalam", "Themes"], "high"],
  ["Reach for the Top", ["Santosh Yadav", "Maria Sharapova"], "medium"],
  ["Kathmandu", ["Travelogue", "Themes"], "low"],
  ["If I Were You", ["Plot", "Characters", "Humour"], "medium"],
  ["Grammar", ["Tenses", "Modals", "Voice", "Subject-verb agreement"], "high"],
  ["Writing Skills", ["Story writing", "Descriptive paragraph", "Diary entry"], "high"],
]);

// ---------------- CAT ----------------
const CAT_VARC = build("Verbal Ability and Reading Comprehension", [
  ["Para Jumbles", ["Identifying logical order", "Topic sentences", "Connecting ideas"], "high"],
  ["Reading Comprehension", ["Inference questions", "Main idea", "Tone & attitude", "Vocabulary in context"], "high"],
  ["Para Summary", ["Identifying central theme", "Eliminating distractors"], "high"],
  ["Odd Sentence Out", ["Logical coherence", "Topic identification"], "high"],
  ["Fill in the Blanks", ["Contextual vocabulary", "Connectors"], "high"],
]);
const CAT_DILR = build("Data Interpretation and Logical Reasoning", [
  ["Bar Graphs", ["Single & multiple bar graphs", "Comparison & calculation"], "high"],
  ["Pie Charts", ["Percentage calculation", "Combined data sets"], "high"],
  ["Tables", ["Tabular data analysis", "Caselets"], "high"],
  ["Line Graphs", ["Trend analysis", "Calculations"], "high"],
  ["Seating Arrangement", ["Linear", "Circular", "Conditions based"], "high"],
  ["Blood Relations", ["Family tree", "Coded relations"], "high"],
  ["Syllogisms", ["Categorical syllogisms", "Venn diagrams"], "high"],
  ["Puzzles", ["Grid puzzles", "Logical deductions"], "high"],
]);
const CAT_QA = build("Quantitative Aptitude", [
  ["Number System", ["Divisibility", "Remainders", "Factors & multiples"], "high"],
  ["Arithmetic", ["Percentages", "Profit & loss", "Time speed distance", "Time & work", "Ratios"], "high"],
  ["Algebra", ["Equations", "Inequalities", "Functions", "Logarithms"], "high"],
  ["Geometry", ["Triangles", "Circles", "Quadrilaterals", "Mensuration", "Coordinate geometry"], "high"],
  ["Modern Maths", ["Permutations & combinations", "Probability", "Sequences & series", "Set theory"], "high"],
]);

// ---------------- GATE CS ----------------
const GATE_CS = [
  build("Engineering Mathematics", [
    ["Discrete Mathematics", ["Propositional logic", "Set theory", "Relations & functions", "Graph theory"], "high"],
    ["Linear Algebra", ["Matrices", "Determinants", "Eigenvalues & eigenvectors"], "high"],
    ["Calculus", ["Limits continuity differentiability", "Maxima & minima", "Integration"], "medium"],
    ["Probability", ["Random variables", "Distributions", "Mean & variance"], "high"],
  ]),
  build("Digital Logic", [
    ["Boolean Algebra", ["Boolean expressions", "K-maps", "Logic gates"], "high"],
    ["Combinational Circuits", ["Multiplexer", "Decoder", "Adder"], "high"],
    ["Sequential Circuits", ["Flip-flops", "Counters", "Registers"], "high"],
    ["Number Representation", ["Fixed & floating point", "2's complement"], "medium"],
  ]),
  build("Computer Organization and Architecture", [
    ["Instruction Set", ["Machine instructions", "Addressing modes"], "high"],
    ["Pipelining", ["Hazards", "Performance"], "high"],
    ["Memory Hierarchy", ["Cache memory", "Virtual memory"], "high"],
    ["I/O Systems", ["Interrupts", "DMA"], "medium"],
  ]),
  build("Programming and Data Structures", [
    ["Programming in C", ["Recursion", "Pointers", "Arrays", "Structures"], "high"],
    ["Linear Data Structures", ["Stacks", "Queues", "Linked lists"], "high"],
    ["Trees", ["Binary trees", "BST", "AVL trees", "Heaps"], "high"],
    ["Graphs", ["Representations", "Traversals"], "high"],
    ["Hashing", ["Hash functions", "Collision resolution"], "medium"],
  ]),
  build("Algorithms", [
    ["Asymptotic Analysis", ["Big-O notation", "Recurrence relations", "Master theorem"], "high"],
    ["Sorting & Searching", ["Quicksort", "Mergesort", "Heapsort", "Binary search"], "high"],
    ["Greedy Algorithms", ["MST", "Huffman coding"], "high"],
    ["Dynamic Programming", ["LCS", "Knapsack", "Matrix chain"], "high"],
    ["Graph Algorithms", ["BFS DFS", "Shortest paths", "Topological sort"], "high"],
  ]),
  build("Theory of Computation", [
    ["Regular Languages", ["DFA NFA", "Regular expressions", "Pumping lemma"], "high"],
    ["Context Free Languages", ["CFG", "PDA", "Parsing"], "high"],
    ["Turing Machines", ["Decidability", "Undecidability"], "medium"],
  ]),
  build("Compiler Design", [
    ["Lexical Analysis", ["Tokens", "Finite automata"], "medium"],
    ["Parsing", ["Top-down", "Bottom-up", "LR parsing"], "high"],
    ["Syntax Directed Translation", ["Attribute grammar", "Intermediate code"], "medium"],
    ["Code Optimization", ["Local & global optimization"], "low"],
  ]),
  build("Operating Systems", [
    ["Process Management", ["Scheduling", "Synchronisation", "Deadlocks"], "high"],
    ["Memory Management", ["Paging", "Segmentation", "Virtual memory"], "high"],
    ["File Systems", ["File allocation", "Directory structure"], "medium"],
    ["I/O Management", ["Disk scheduling"], "medium"],
  ]),
  build("Databases", [
    ["ER Model", ["Entities", "Relationships", "Cardinality"], "medium"],
    ["Relational Model", ["Relational algebra", "SQL", "Integrity constraints"], "high"],
    ["Normalization", ["Functional dependencies", "1NF to BCNF"], "high"],
    ["Transactions", ["ACID properties", "Concurrency control", "Recovery"], "high"],
  ]),
  build("Computer Networks", [
    ["OSI Model", ["Layers & functions"], "medium"],
    ["Data Link Layer", ["Framing", "Error detection", "MAC protocols"], "high"],
    ["Network Layer", ["IP addressing", "Routing algorithms"], "high"],
    ["Transport Layer", ["TCP UDP", "Flow & congestion control"], "high"],
    ["Application Layer", ["DNS HTTP SMTP", "Sockets"], "medium"],
  ]),
];

// ---------------- UPSC Prelims ----------------
const UPSC_PRELIMS = [
  build("General Studies Paper 1", [
    ["Ancient History", ["Indus Valley", "Vedic period", "Mauryan empire", "Gupta period"], "medium"],
    ["Medieval History", ["Delhi Sultanate", "Mughal empire", "Bhakti & Sufi movements"], "medium"],
    ["Modern History", ["British conquest", "Revolt of 1857", "Freedom struggle", "Post-independence"], "high"],
    ["Indian Polity", ["Constitution", "Fundamental rights", "Parliament", "Judiciary", "Local government"], "high"],
    ["Indian Economy", ["National income", "Planning", "Banking", "Budget", "External sector"], "high"],
    ["Geography", ["Physical geography", "Indian geography", "World geography", "Economic geography"], "high"],
    ["Environment and Ecology", ["Ecosystems", "Biodiversity", "Climate change", "Conservation efforts"], "high"],
    ["General Science", ["Physics basics", "Chemistry basics", "Biology basics", "Science & technology"], "medium"],
    ["Current Affairs", ["National events", "International events", "Government schemes", "Reports & indices"], "high"],
  ]),
  build("CSAT Paper 2", [
    ["Reading Comprehension", ["Passage analysis", "Inference"], "high"],
    ["Logical Reasoning", ["Analytical reasoning", "Verbal reasoning"], "high"],
    ["Basic Numeracy", ["Numbers", "Percentages", "Ratios"], "high"],
    ["Data Interpretation", ["Tables", "Charts", "Graphs"], "high"],
  ]),
];

// ---------------- SSC CGL ----------------
const SSC_CGL = [
  build("General Intelligence and Reasoning", [
    ["Verbal Reasoning", ["Analogies", "Series", "Coding-decoding", "Blood relations"], "high"],
    ["Non-verbal Reasoning", ["Pattern completion", "Figure series", "Mirror images"], "high"],
    ["Logical Reasoning", ["Syllogisms", "Statement & conclusion", "Seating arrangement"], "high"],
  ]),
  build("General Awareness", [
    ["History", ["Ancient medieval modern Indian history"], "high"],
    ["Geography", ["Indian & world geography"], "high"],
    ["Polity", ["Constitution", "Government structure"], "high"],
    ["Economy", ["Basic economics", "Indian economy"], "high"],
    ["Science", ["Physics chemistry biology basics"], "medium"],
    ["Current Affairs", ["National & international events"], "high"],
  ]),
  build("Quantitative Aptitude", [
    ["Arithmetic", ["Percentage", "Ratio & proportion", "Profit & loss", "Time & work"], "high"],
    ["Algebra", ["Linear & quadratic equations"], "high"],
    ["Geometry", ["Triangles", "Circles", "Quadrilaterals"], "high"],
    ["Mensuration", ["2D & 3D figures"], "high"],
    ["Trigonometry", ["Identities", "Heights & distances"], "high"],
    ["Data Interpretation", ["Tables", "Bar & pie charts"], "high"],
  ]),
  build("English Comprehension", [
    ["Grammar", ["Tenses", "Articles", "Prepositions", "Subject-verb agreement"], "high"],
    ["Vocabulary", ["Synonyms", "Antonyms", "One word substitution", "Idioms & phrases"], "high"],
    ["Reading Comprehension", ["Passage based questions"], "high"],
    ["Sentence Improvement", ["Error spotting", "Sentence rearrangement"], "high"],
  ]),
];

// ---------------- CUET ----------------
const CUET = [
  build("General Test", [
    ["Numerical Ability", ["Arithmetic", "Mensuration", "Data interpretation"], "high"],
    ["Logical Reasoning", ["Analytical reasoning", "Verbal & non-verbal reasoning"], "high"],
    ["General Knowledge", ["Static GK", "Indian history & geography"], "high"],
    ["Current Affairs", ["National & international", "Awards & sports"], "high"],
  ]),
  build("Language", [
    ["Reading Comprehension", ["Factual passages", "Literary passages", "Narrative passages"], "high"],
    ["Verbal Ability", ["Vocabulary", "Grammar", "Sentence completion"], "high"],
  ]),
];

// ---------------- SAT ----------------
const SAT_EXAM = [
  build("Math", [
    ["Algebra", ["Linear equations", "Systems of equations", "Inequalities"], "high"],
    ["Problem Solving and Data Analysis", ["Ratios", "Percentages", "Data interpretation"], "high"],
    ["Advanced Math", ["Quadratics", "Polynomials", "Exponential functions"], "high"],
    ["Geometry and Trigonometry", ["Triangles", "Circles", "Trig ratios"], "high"],
  ]),
  build("Evidence-Based Reading and Writing", [
    ["Reading Comprehension", ["Main idea", "Inference", "Author's purpose", "Evidence"], "high"],
    ["Grammar", ["Punctuation", "Sentence structure", "Subject-verb agreement"], "high"],
    ["Expression of Ideas", ["Word choice", "Transitions", "Logical sequence"], "high"],
  ]),
];

// ---------------- IELTS ----------------
const IELTS = [
  build("Listening", [
    ["Section 1 — Everyday Conversation", ["Form filling", "Note completion"], "high"],
    ["Section 2 — Monologue", ["Multiple choice", "Map labelling"], "high"],
    ["Section 3 — Academic Discussion", ["Matching", "Short answer"], "high"],
    ["Section 4 — Academic Lecture", ["Summary completion", "Note taking"], "high"],
  ]),
  build("Academic Reading", [
    ["Identifying Information", ["True / False / Not Given"], "high"],
    ["Matching Headings", ["Paragraph headings"], "high"],
    ["Sentence Completion", ["Filling gaps"], "high"],
    ["Summary Completion", ["With and without word list"], "high"],
  ]),
  build("Academic Writing", [
    ["Task 1 — Report Writing", ["Bar charts", "Line graphs", "Pie charts", "Process diagrams"], "high"],
    ["Task 2 — Essay Writing", ["Opinion essays", "Discussion essays", "Problem & solution"], "high"],
  ]),
  build("Speaking", [
    ["Part 1 — Introduction", ["Personal questions", "Familiar topics"], "high"],
    ["Part 2 — Long Turn", ["Cue card", "2-minute speech"], "high"],
    ["Part 3 — Discussion", ["Abstract topics", "Detailed answers"], "high"],
  ]),
];

// ---------------- TOEFL ----------------
const TOEFL = [
  build("Reading", [
    ["Academic Passages", ["Main idea", "Detail questions", "Vocabulary in context", "Inference"], "high"],
    ["Summary Questions", ["Identifying key ideas"], "high"],
  ]),
  build("Listening", [
    ["Lectures", ["Note taking", "Main idea", "Detail"], "high"],
    ["Conversations", ["Function questions", "Attitude questions"], "high"],
  ]),
  build("Speaking", [
    ["Independent Task", ["Personal preference response"], "high"],
    ["Integrated Tasks", ["Reading + listening summary", "Listening summary"], "high"],
  ]),
  build("Writing", [
    ["Integrated Writing", ["Comparing reading & lecture"], "high"],
    ["Academic Discussion", ["Opinion writing"], "high"],
  ]),
];

// ---------------- GRE ----------------
const GRE = [
  build("Verbal Reasoning", [
    ["Text Completion", ["Vocabulary in context"], "high"],
    ["Sentence Equivalence", ["Synonyms in context"], "high"],
    ["Reading Comprehension", ["Main idea", "Inference", "Critical reasoning"], "high"],
  ]),
  build("Quantitative Reasoning", [
    ["Arithmetic", ["Number properties", "Percentages", "Ratios"], "high"],
    ["Algebra", ["Equations", "Inequalities", "Functions"], "high"],
    ["Geometry", ["Triangles", "Circles", "Coordinate geometry"], "high"],
    ["Data Analysis", ["Statistics", "Probability", "Charts"], "high"],
  ]),
  build("Analytical Writing", [
    ["Analyze an Issue", ["Argument structure", "Examples"], "high"],
  ]),
];

// ---------------- GMAT ----------------
const GMAT = [
  build("Verbal", [
    ["Critical Reasoning", ["Assumption", "Strengthen weaken", "Inference"], "high"],
    ["Reading Comprehension", ["Main idea", "Detail", "Tone"], "high"],
    ["Sentence Correction", ["Grammar", "Idioms", "Concision"], "high"],
  ]),
  build("Quantitative", [
    ["Problem Solving", ["Arithmetic", "Algebra", "Geometry"], "high"],
    ["Data Sufficiency", ["Analysis of statements"], "high"],
  ]),
  build("Integrated Reasoning", [
    ["Multi-source Reasoning", ["Synthesising information"], "high"],
    ["Graphics Interpretation", ["Charts & graphs"], "high"],
    ["Table Analysis", ["Sorting & filtering"], "high"],
    ["Two-part Analysis", ["Quantitative & verbal"], "high"],
  ]),
  build("Analytical Writing Assessment", [
    ["Analysis of an Argument", ["Identifying flaws", "Structured response"], "high"],
  ]),
];

// ---------------- Lookup table ----------------
const TABLE: Record<string, PreloadedSubject[]> = {
  "jee main": [JEE_PHYSICS, JEE_CHEM, JEE_MATH],
  "jee advanced": [JEE_PHYSICS, JEE_CHEM, JEE_MATH],
  "bitsat": [JEE_PHYSICS, JEE_CHEM, JEE_MATH],
  "viteee": [JEE_PHYSICS, JEE_CHEM, JEE_MATH],
  "neet": [JEE_PHYSICS, JEE_CHEM, NEET_BIO],
  "cbse grade 12 physics": [CBSE12_PHY],
  "cbse grade 12 chemistry": [CBSE12_CHEM],
  "cbse grade 12 mathematics": [CBSE12_MATH],
  "cbse grade 12 biology": [CBSE12_BIO],
  "cbse grade 11 physics": [CBSE11_PHY],
  "cbse grade 11 chemistry": [CBSE11_CHEM],
  "cbse grade 11 mathematics": [CBSE11_MATH],
  "cbse grade 11 biology": [CBSE11_BIO],
  "cbse grade 10 science": [CBSE10_SCIENCE],
  "cbse grade 10 mathematics": [CBSE10_MATH],
  "cbse grade 10 social science": [CBSE10_SST],
  "cbse grade 10 english": [CBSE10_ENG],
  "cbse grade 9 science": [CBSE9_SCIENCE],
  "cbse grade 9 mathematics": [CBSE9_MATH],
  "cbse grade 9 social science": [CBSE9_SST],
  "cbse grade 9 english": [CBSE9_ENG],
  "cat": [CAT_VARC, CAT_DILR, CAT_QA],
  "gate": GATE_CS,
  "upsc": UPSC_PRELIMS,
  "ssc cgl": SSC_CGL,
  "cuet": CUET,
  "sat": SAT_EXAM,
  "ielts": IELTS,
  "toefl": TOEFL,
  "gre": GRE,
  "gmat": GMAT,
};

export function getPreloadedSyllabus(
  goalName: string,
): PreloadedSubject[] | null {
  if (!goalName) return null;
  const key = goalName.trim().toLowerCase();
  if (TABLE[key]) return TABLE[key];
  // Loose match: e.g. "Class 12 Physics" or "Grade 10 Math"
  for (const k of Object.keys(TABLE)) {
    if (key === k) return TABLE[k];
  }
  return null;
}