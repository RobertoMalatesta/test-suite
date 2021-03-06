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
import { Comparison, InverseCumulativePoisson, PoissonPseudoRandom, PseudoRandom, version } from 'https://cdn.jsdelivr.net/npm/@quantlib/ql@latest/ql.mjs';

describe(`RNG traits tests ${version}`, () => {
    it('Testing Gaussian pseudo-random number generation...', () => {
        const rsg = new PseudoRandom().make_sequence_generator(100, 1234);
        const values = rsg.nextSequence().value;
        let sum = 0.0;
        for (let i = 0; i < values.length; i++) {
            sum += values[i];
        }
        const stored = 4.09916;
        const tolerance = 1.0e-5;
        expect(Math.abs(sum - stored)).toBeLessThan(tolerance);
    });

    it('Testing Poisson pseudo-random number generation...', () => {
        const rsg = new PoissonPseudoRandom().make_sequence_generator(100, 1234);
        const values = rsg.nextSequence().value;
        let sum = 0.0;
        for (let i = 0; i < values.length; i++) {
            sum += values[i];
        }
        const stored = 108.0;
        expect(Comparison.close(sum, stored)).toBeTruthy();
    });

    it('Testing custom Poisson pseudo-random number generation...', () => {
        const g = new PoissonPseudoRandom();
        g.IC = new InverseCumulativePoisson(4.0);
        const rsg = g.make_sequence_generator(100, 1234);
        const values = rsg.nextSequence().value;
        let sum = 0.0;
        for (let i = 0; i < values.length; i++) {
            sum += values[i];
        }
        const stored = 409.0;
        expect(Comparison.close(sum, stored)).toBeTruthy();
    });
});
