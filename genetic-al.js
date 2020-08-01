var pr = require("./geom.js");

// main object (main functions)
Genetic = {
  Optimization: {
    //optimization methods
    Maximize: function (a, b) {
      return a >= b;
    },
    Minimize: function (a, b) {
      return a < b;
    },
  },

  // selection methods that select one individual
  Selection1: {
    RouletteWheel: function (pop, totalFitness) {
      var seed = Math.floor(Math.random() * totalFitness);

      for (var i = 0; i < pop.length; ++i) {
        const object = pop[i];
        const rate = object.fitness;
        if (seed < rate) return object;
        seed -= rate;
      }
    },
    Tournament2: function (pop) {
      var n = pop.length;
      var a = pop[Math.floor(Math.random() * n)];
      var b = pop[Math.floor(Math.random() * n)];
      return configuration.optimize(a.fitness, b.fitness) ? a : b;
    },
    Tournament3: function (pop) {
      var n = pop.length;
      var a = pop[Math.floor(Math.random() * n)];
      var b = pop[Math.floor(Math.random() * n)];
      var c = pop[Math.floor(Math.random() * n)];
      var best = this.optimize(a.fitness, b.fitness) ? a : b;
      best = configuration.optimize(best.fitness, c.fitness) ? best : c;
      return best;
    },
    Fittest: function (pop) {
      return pop[0];
    },
    Random: function (pop) {
      return pop[Math.floor(Math.random() * pop.length)];
    },
  },
  // selection methods that select two individuals
  Selection2: {
    RouletteWheel: function (pop, totalFitness) {
      return [
        Genetic.Selection1.RouletteWheel(pop, totalFitness),
        Genetic.Selection1.RouletteWheel(pop, totalFitness),
      ];
    },
    Tournament2: function (pop) {
      return [
        Genetic.Selection1.Tournament2(pop),
        Genetic.Selection1.Tournament2(pop),
      ];
    },
    Tournament3: function (pop) {
      return [
        Genetic.Selection1.Tournament3(pop),
        Genetic.Selection1.Tournament3(pop),
      ];
    },
    Random: function (pop) {
      return [
        Genetic.Selection1.Random(pop), 
        Genetic.Selection1.Random(pop)
      ];
    },
    FittestRandom: function (pop) {
      return [
        Genetic.Selection1.Fittest(pop), 
        Genetic.Selection1.Random(pop)
      ];
    },
  },
  //crossover function
  Crossover: {
    SinglePoint: function (mother, father) {
      var son = [];
      var daughter = [];

      // one-point crossover
      var len = mother.length;
      var ca = Math.floor(Math.random() * len);

      son = son.concat(father.slice(0, ca), mother.slice(ca));
      daughter = daughter.concat(mother.slice(0, ca), father.slice(ca));

      return [son, daughter];
    },
    TwoPoint: function (mother, father) {
      var son = [];
      var daughter = [];

      // choose two crossover points.
      var len = mother.length;
      var ca = Math.floor(Math.random() * len);
      var cb = ca + Math.floor(Math.random() * (len - ca));

      if (ca == cb && ca < len - 1) {
        cb++;
      }

      son = son.concat(
        father.slice(0, ca),
        mother.slice(ca, cb),
        father.slice(cb)
      );
      daughter = daughter.concat(
        mother.slice(0, ca),
        father.slice(ca, cb),
        mother.slice(cb)
      );

      return [son, daughter];
    },
    Uniform: function (mother, father) {
      var son = [],
        parents = [mother, father];
      for (var i = 0; i < mother.length; i++) {
        son[i] = parents[Math.round(Math.random())][i];
      }
      return son;
    },
    PartiallyMapped: function (father, mother) {
      // create two maps, not necessary, but simpler
      var map1 = {};
      var map2 = {};

      // choose two crossover points.
      var ca = Math.floor(Math.random() * (father.length - 1));
      var cb = ca + Math.floor(Math.random() * (father.length - ca));

      if (ca == cb && ca < father.length - 1) {
        cb++;
      }

      var offspring = [Array.from(father), Array.from(mother)];

      for (var i = ca; i < cb; i++) {
        offspring[0][i] = mother[i];
        map1[mother[i]] = father[i];

        offspring[1][i] = father[i];
        map2[father[i]] = mother[i];
      }
      for (var i = 0; i < ca; i++) {
        while (offspring[0][i] in map1) {
          offspring[0][i] = map1[offspring[0][i]];
        }
        while (offspring[1][i] in map2) {
          offspring[1][i] = map2[offspring[1][i]];
        }
      }
      for (var i = cb; i < father.length; i++) {
        while (offspring[0][i] in map1) {
          offspring[0][i] = map1[offspring[0][i]];
        }
        while (offspring[1][i] in map2) {
          offspring[1][i] = map2[offspring[1][i]];
        }
      }
      return offspring;
    },
  },

  //mutation function
  Mutation: {
    //swaps two individuals
    SwapMutation: function (parent) {
      var offspring = parent.slice();
      var len = offspring.length;
      // two-point for swapping in mutation
      var ca = 1 + Math.floor(Math.random() * (len - 1));
      var cb = ca + Math.floor(Math.random() * (len - ca));
      if (ca == cb && ca < len - 1) {
        cb++;
      }

      //swap two items
      var tmp = offspring[ca];
      offspring[ca] = offspring[cb];
      offspring[cb] = tmp;

      return offspring;
    },
    //shuffles some subset of individual
    ScrambleMutation: function (parent) {
      var offspring = [];

      //shuffle array with algorithm (from the book The Art of Computer Programming by Donald E. Knuth)
      function shuffle(array) {
        for (var i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * i);
          const temp = array[i];
          array[i] = array[j];
          array[j] = temp;
        }
        return array;
      }

      // choose two points for shuffle items between them
      var len = parent.length;
      var ca = 1 + Math.floor(Math.random() * (len - 1));
      var cb = ca + Math.floor(Math.random() * (len - ca));

      if (ca == cb && ca < len - 1) {
        cb++;
      }

      //shuffle items
      var tmp = shuffle(parent.slice(ca, cb));
      offspring = offspring.concat(parent.slice(0, ca), tmp, parent.slice(cb));
      return offspring;
    },
    //reverse subset of the individual
    InversionMutation: function (parent) {
      var offspring = [];
      // choose two points for shuffle items between them
      var len = parent.length;
      var ca = 1 + Math.floor(Math.random() * (len - 1));
      var cb = ca + Math.floor(Math.random() * (len - ca));

      if (ca == cb && ca < len - 1) {
        cb++;
      }

      //Inverse items
      var tmp = parent.slice(ca, cb).reverse();
      //concat arrays
      offspring = offspring.concat(parent.slice(0, ca), tmp, parent.slice(cb));
      return offspring;
    },
  },
};

Problem = {
  //Fitness
  Fitness: function (entity) {
    //get polyline(individual)data from project
    info = run(entity, POLYGON.coordinates);
    var fitness = 0;
    //get lenght reduction senarios point
    fitness += configuration.lengthReduction(
      configuration.sourceLen,
      info.totalLength
    );
    polygon1 = [];
    polygon2 = [];
    polygon3 = [];
    var neededArea = 0;

    // function for find min item btween arrays spacific indexed item
    function findMin(arr, num) {
      var min = arr[0][num];
      for (var g = 1, len = arr.length; g < len; g++) {
        var v = arr[g][num];
        min = v < min ? v : min;
      }
      return min;
    }
    // function for calculate sum of spacific indexed items in an array
    function findSum(arr, num) {
      var sum = arr[0][num];
      for (var d = 1, len = arr.length; d < len; d++) {
        sum += arr[d][num];
      }
      return sum;
    }
    //function for find min item in an array
    function arrayMin(array) {
      var min = Math.min.apply(null, array);
      if (min == Infinity) {
        min = 0;
      }
      return min;
    }
    //calculate each polygons point for polyline
    for (var i = 0; i < POLYGON.type.length; i++) {
      if (POLYGON.type[i] == "Polygon1")
        polygon1.push(this.PolyPoint.Polygon1(findMin(info.distances, i)));
      if (POLYGON.type[i] == "Polygon2") {
        polygon2.push(
          this.PolyPoint.Polygon2(
            findMin(info.distances, i),
            info.polygonAreas[i]
          )[0]
        );
        neededArea += this.PolyPoint.Polygon2(
          findMin(info.distances, i),
          info.polygonAreas[i]
        )[1];
      }
      if (POLYGON.type[i] == "Polygon3")
        polygon3.push(
          this.PolyPoint.Polygon3(
            info.totalLength,
            findSum(info.lengthInPolygons, i),
            findMin(info.distances, i)
          )
        );
    }
    if (polygon2.includes(222) && neededArea / info.totalPolygonArea > 0.9) {
      polygon2.push(2);
    }
    if (polygon2.length == 1 && polygon2[0] == 222) {
      polygon2.push(0);
    }
    fitness += arrayMin(polygon1);

    fitness += arrayMin(polygon2);

    fitness += arrayMin(polygon3);

    return [fitness, info];
  },

  //Length reduction senarios for fitness
  LengthReductions: {
    first: function (sourceLen, Len) {
      if (sourceLen == Len) return 0;
      reduction = ((sourceLen - Len) / sourceLen) * 100;
      if (reduction >= 50) return 20;
      if (reduction >= 30) return 15;
      if (reduction >= 15) return 10;
      if (reduction >= 5) return 5;
      else return 0;
    },
    second: function (sourceLen, Len) {
      if (sourceLen == Len) return 0;
      reduction = ((sourceLen - Len) / sourceLen) * 100;
      if ((reduction = 100)) return 22;
      if (reduction >= 50) return 18;
      if (reduction >= 25) return 13;
      if (reduction >= 10) return 8;
      else return 0;
    },
  },

  //distance and intersection length senarios for fitness
  PolyPoint: {
    Polygon1: function (distance) {
      if (distance >= 100) return 16;
      if (distance >= 45) return 12;
      if (distance > 0) return 6;
      else return 0;
    },
    Polygon2: function (distance, area) {
      if (distance >= 60) return [16, area];
      if (distance >= 45) return [12, area];
      if (distance >= 30) return [6, area];
      if (distance >= 15) return [222, area];
      else return [0, 0];
    },
    Polygon3: function (total, length, distance) {
      if (distance > 0) return 12;
      if (length / total < 0.05) return 8;
      if (length / total < 0.1) return 2;
      else return 0;
    },
  },

  // create each line (individual)
  Seed: function (coordinates, count) {
    individual = [];
    individual.push(coordinates[0], coordinates[1]);

    //function for check duplicates in an array
    function cordDuplicate(arr, item) {
      var item_as_string = JSON.stringify(item);
      var contains = arr.some(function (ele) {
        return JSON.stringify(ele) === item_as_string;
      });
      return contains;
    }
    while (individual.length < count) {
      rangeY = [
        Math.min(coordinates[0][1], coordinates[1][1]),
        Math.max(coordinates[0][1], coordinates[1][1]),
      ];
      rangeX = [
        Math.min(coordinates[0][0], coordinates[1][0]),
        Math.max(coordinates[0][0], coordinates[1][0]),
      ];
      rand = [
        Math.floor(Math.random() * (rangeX[1] - rangeX[0] + 1) + rangeX[0]),
        Math.floor(Math.random() * (rangeY[1] - rangeY[0] + 1) + rangeY[0]),
      ];
      if (!cordDuplicate(individual, rand)) individual.push(rand);
    }
    individual.splice(1, 1);
    individual.push(coordinates[1]);
    return individual;
  },
};

// genetic algorithm configurations
configuration = {
  size: 10,
  crossover: Genetic.Crossover.PartiallyMapped,
  mutation: Genetic.Mutation.ScrambleMutation,
  crossoverPr: 0.7,
  mutationPr: 0.2,
  iterations: 1000,
  fittestAlwaysSurvives: true,
  optimize: Genetic.Optimization.Maximize,
  select1: Genetic.Selection1.Tournament2,
  select2: Genetic.Selection2.Tournament2,
  individualCount: 5,
  coordinates: [
    [-90, 10],
    [100, 80],
  ],
  lengthReduction: Problem.LengthReductions.first,
  sourceLen: 1000,
};

//a tiny middleware for our objects
var Clone = function (obj) {
  if (obj == null || typeof obj != "object") return obj;

  return JSON.parse(JSON.stringify(obj));
};

function start() {
  var entities = [];

  // create the population
  for (i = 0; i < this.configuration.size; ++i) {
    entities.push(
      Clone(
        Problem.Seed(configuration.coordinates, configuration.individualCount)
      )
    );
  }

  // create generations
  for (var i = 0; i < configuration.iterations; i++) {
    function calFitness(population) {
      var calculated = [];
      totalFits = 0;
      for (var i = 0; i < population.length - 1; i++) {
        var calculation = Problem.Fitness(population[i]);
        totalFits += calculation[0];
        calculated.push({
          fitness: calculation[0],
          entity: population[i],
          info: calculation[1],
        });
      }
      return [calculated, totalFits];
    }

    const totalFit = calFitness(entities)[1];

    // calculate fitness for each individual and sort them
    var pop = calFitness(entities)[0].sort(function (a, b) {
      return configuration.optimize(a.fitness, b.fitness) ? -1 : 1;
    });

    // more information
    var mean = totalFit / pop.length;

    var stats = {
      "polygons-areas": pop[0].info.polygonAreas,
      mean: mean,
      "maximum-cords": JSON.stringify(pop[0].entity),
      "maximum-fitness": pop[0].fitness,
      "maximum-distances:": pop[0].info.distances,
      "maximum-intersections": JSON.stringify(pop[0].info.intersection),
      "maximum-lengthInPolygons:": pop[0].info.lengthInPolygons,
      "maximum-length:": pop[0].info.totalLength,
      "minimum-cords": pop[pop.length - 1].entity,
      "minimum-fitness": pop[pop.length - 1].fitness,
      "minimum-distances:": pop[pop.length - 1].info.distances,
      "minimum-lengthInPolygons:": pop[pop.length - 1].info.lengthInPolygons,
      "minimum-length:": pop[pop.length - 1].info.totalLength,
    };

    // crossover and mutate
    function mutates(entity) {
      // applies mutation based on mutation probability
      return Math.random() <= configuration.mutationPr
        ? configuration.mutation(Clone(entity))
        : entity;
    }
    var newPop = [];

    if (configuration.fittestAlwaysSurvives)
      // lets the best solution fall through
      newPop.push(pop[0].entity);

    while (newPop.length < configuration.size) {
      //crossover
      if (
        Math.random() <= configuration.crossoverPr && // base crossover on specified probability
        newPop.length + 1 < configuration.size // keeps us from going 1 over the max population size
      ) {
        var parents =
          configuration.select2.name == "RouletteWheel"
            ? configuration.select2(pop, totalFit)
            : configuration.select2(pop);
        var children = configuration
          .crossover(Clone(parents[0].entity), Clone(parents[1].entity))
          .map(mutates);
        newPop.push(children[0], children[1]);
      }
      //mutation
      else {
        var parent =
          configuration.select1.name == "RouletteWheel"
            ? configuration.select1(pop, totalFit)
            : configuration.select1(pop);
        var child = mutates(Clone(parent.entity));
        newPop.push(child);
      }
    }
    this.entities = newPop;
  }
  return stats;
}

console.log(start());
