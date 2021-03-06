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
import { ObservableSettings, Observer, SimpleQuote, version } from 'https://cdn.jsdelivr.net/npm/@quantlib/ql@latest/ql.mjs';

class UpdateCounter extends Observer {
    constructor() {
        super(...arguments);
        this._counter = 0;
    }
    update() {
        ++this._counter;
    }
    counter() {
        return this._counter;
    }
}

describe(`Observer tests ${version}`, () => {
    it('Testing observable settings...', () => {
        const quote = new SimpleQuote(100.0);
        const updateCounter = new UpdateCounter();
        updateCounter.registerWith(quote);
        expect(updateCounter.counter()).toEqual(0);
        quote.setValue(1.0);
        expect(updateCounter.counter()).toEqual(1);
        ObservableSettings.disableUpdates(false);
        quote.setValue(2.0);
        expect(updateCounter.counter()).toEqual(1);
        ObservableSettings.enableUpdates();
        expect(updateCounter.counter()).toEqual(1);
        ObservableSettings.disableUpdates(true);
        quote.setValue(3.0);
        expect(updateCounter.counter()).toEqual(1);
        ObservableSettings.enableUpdates();
        expect(updateCounter.counter()).toEqual(2);
        const updateCounter2 = new UpdateCounter();
        updateCounter2.registerWith(quote);
        ObservableSettings.disableUpdates(true);
        for (let i = 0; i < 10; ++i) {
            quote.setValue(i);
        }
        expect(updateCounter.counter()).toEqual(2);
        ObservableSettings.enableUpdates();
        expect(updateCounter.counter()).toEqual(3);
        expect(updateCounter2.counter()).toEqual(1);
    });
});