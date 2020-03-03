import random from 'random'
import { CountryAgeDistribution, OneCountryAgeDistribution } from '../assets/data/CountryAgeDistribution.types'
import { SeverityTableRow } from '../components/Main/SeverityTable'
import { AllParams } from './Param.types'
import { AlgorithmResult, SimulationTimePoint } from './Result.types'
// import { populationAverageParameters, evolve, exportSimulation } from "./model.js"
import { populationParameters, evolveAgent, unpack, initialPopulation} from "./agentmodel.js"


/**
 *
 * Entry point for the algorithm
 *
 */
export default async function run(
  params: AllParams,
  severity: SeverityTableRow[],
  ageDistribution: OneCountryAgeDistribution,
): Promise<AlgorithmResult> {
  console.log(JSON.stringify({ params }, null, 2));
  // console.log(JSON.stringify({ severity }, null, 2))
  // console.log(JSON.stringify({ countryAgeDistribution }, null, 2))

  // const modelParams = populationAverageParameters(params, severity, countryAgeDistribution[params["ageDistribution"]]);
    //
  const modelParams = populationParameters(params, severity);
  const time = Date.now();
  const initialCases = parseFloat(params.suspectedCasesToday);
  // const initialState = {"time" : time,
  //                       "susceptible" : modelParams.populationServed - initialCases,
  //                       "exposed" : 0,
  //                       "infectious" : initialCases,
  //                       "hospitalized" : 0,
  //                       "discharged" : 0,
  //                       "recovered" : 0,
  //                       "dead" : 0};
  const initialState = {"time" : time, "state": initialPopulation(ageDistribution, initialCases, params.populationServed)};

  const tMax = new Date(params.tMax);
  const identity = function(x: number) {return x;}; 
  const poisson = function(x: number) {return x>0?random.poisson(x)():0;}; 


  function simulate(initialState: SimulationTimePoint , func: (x: number) => number) {
      const dynamics = [initialState];
      while (dynamics[dynamics.length-1].time < tMax) {
        const pop = dynamics[dynamics.length-1];
        dynamics.push(evolveAgent(pop, modelParams, func));
      }

      return dynamics.map(x => unpack(x));
  }
  
  const sim: AlgorithmResult = {
      "deterministicTrajectory": simulate(initialState, poisson),
      "stochasticTrajectories": [],
      "params": modelParams
  };
  console.log(sim["deterministicTrajectory"]);

  // for (let i = 0; i < modelParams.numberStochasticRuns; i++) {
  //     sim.stochasticTrajectories.push(simulate(initialState, poisson));
  // }

  return sim 
}
