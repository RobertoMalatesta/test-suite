/**
 * Copyright 2019 - 2020 Jin Yang. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
import { Actual360, Array2D, BlackScholesMertonProcess, DateExt, Handle, MakeMCPagodaEngine, PagodaOption, PseudoRandom, Settings, SimpleQuote, StochasticProcessArray, version } from 'https://cdn.jsdelivr.net/npm/@quantlib/ql@latest/ql.mjs';
import { flatRate2, flatVol2 } from '/test-suite/utilities.mjs';

describe(`Pagoda-option tests ${version}`, () => {
    it('Testing pagoda option against cached values...', () => {
        const today = Settings.evaluationDate.f();
        const dc = new Actual360();
        const fixingDates = [];
        for (let i = 1; i <= 4; ++i) {
            fixingDates.push(DateExt.add(today, i * 90));
        }
        const roof = 0.20;
        const fraction = 0.62;
        const option = new PagodaOption(fixingDates, roof, fraction);
        const riskFreeRate = new Handle(flatRate2(today, 0.05, dc));
        const processes = new Array(4);
        processes[0] = new BlackScholesMertonProcess(new Handle(new SimpleQuote(0.15)), new Handle(flatRate2(today, 0.01, dc)), riskFreeRate, new Handle(flatVol2(today, 0.30, dc)));
        processes[1] = new BlackScholesMertonProcess(new Handle(new SimpleQuote(0.20)), new Handle(flatRate2(today, 0.05, dc)), riskFreeRate, new Handle(flatVol2(today, 0.35, dc)));
        processes[2] = new BlackScholesMertonProcess(new Handle(new SimpleQuote(0.35)), new Handle(flatRate2(today, 0.04, dc)), riskFreeRate, new Handle(flatVol2(today, 0.25, dc)));
        processes[3] = new BlackScholesMertonProcess(new Handle(new SimpleQuote(0.30)), new Handle(flatRate2(today, 0.03, dc)), riskFreeRate, new Handle(flatVol2(today, 0.20, dc)));
        const correlation = Array2D.newMatrix(4, 4);
        correlation[0][0] = 1.00;
        correlation[0][1] = 0.50;
        correlation[0][2] = 0.30;
        correlation[0][3] = 0.10;
        correlation[1][0] = 0.50;
        correlation[1][1] = 1.00;
        correlation[1][2] = 0.20;
        correlation[1][3] = 0.40;
        correlation[2][0] = 0.30;
        correlation[2][1] = 0.20;
        correlation[2][2] = 1.00;
        correlation[2][3] = 0.60;
        correlation[3][0] = 0.10;
        correlation[3][1] = 0.40;
        correlation[3][2] = 0.60;
        correlation[3][3] = 1.00;
        const seed = 86421;
        const fixedSamples = 1023;
        const process = new StochasticProcessArray(processes, correlation);
        option.setPricingEngine(new MakeMCPagodaEngine(new PseudoRandom())
            .mmcpeInit(process)
            .withSamples(fixedSamples)
            .withSeed(seed)
            .f());
        const value = option.NPV();
        const storedValue = 0.01221094;
        let tolerance = 1.0e-8;
        expect(Math.abs(value - storedValue)).toBeLessThan(tolerance);
        const minimumTol = 1.0e-2;
        tolerance = option.errorEstimate();
        tolerance = Math.min(tolerance / 2.0, minimumTol * value);
        option.setPricingEngine(new MakeMCPagodaEngine(new PseudoRandom())
            .mmcpeInit(process)
            .withAbsoluteTolerance(tolerance)
            .withSeed(seed)
            .f());
        option.NPV();
        const accuracy = option.errorEstimate();
        expect(accuracy).toBeLessThan(tolerance);
    });
});
