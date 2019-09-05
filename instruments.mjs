import { Actual360, AnalyticEuropeanEngine, BlackScholesMertonProcess, CompositeInstrument, DateExt, EuropeanExercise, EuropeanOption, Handle, Option, PlainVanillaPayoff, RelinkableHandle, Settings, SimpleQuote, Stock } from '/ql.mjs';
import { Flag, flatRate4, flatVol4 } from '/test-suite/utilities.mjs';
describe('Instrument tests', () => {
    it('Testing observability of instruments...', () => {
        const me1 = new SimpleQuote(0.0);
        const h = new RelinkableHandle(me1);
        const s = new Stock(h);
        const f = new Flag();
        f.registerWith(s);
        s.NPV();
        me1.setValue(3.14);
        expect(f.isUp()).toEqual(true);
        s.NPV();
        f.lower();
        const me2 = new SimpleQuote(0.0);
        h.linkTo(me2);
        expect(f.isUp()).toEqual(true);
        f.lower();
        s.freeze();
        s.NPV();
        me2.setValue(2.71);
        expect(f.isUp()).toEqual(false);
        s.NPV();
        s.unfreeze();
        expect(f.isUp()).toEqual(true);
    });
    it('Testing reaction of composite instrument to date changes...', () => {
        const today = new Date();
        const dc = new Actual360();
        const payoff = new PlainVanillaPayoff(Option.Type.Call, 100.0);
        const exercise = new EuropeanExercise(DateExt.add(today, 30));
        const option = new EuropeanOption(payoff, exercise);
        const spot = new SimpleQuote(100.0);
        const qTS = flatRate4(0.0, dc);
        const rTS = flatRate4(0.01, dc);
        const volTS = flatVol4(0.1, dc);
        const process = new BlackScholesMertonProcess(new Handle(spot), new Handle(qTS), new Handle(rTS), new Handle(volTS));
        const engine = new AnalyticEuropeanEngine().init1(process);
        option.setPricingEngine(engine);
        const composite = new CompositeInstrument();
        composite.add(option);
        Settings.evaluationDate.set(DateExt.add(today, 45));
        expect(composite.isExpired()).toEqual(true);
        expect(composite.NPV()).toEqual(0.0);
        Settings.evaluationDate.set(today);
        expect(composite.isExpired()).toEqual(false);
        expect(composite.NPV()).not.toEqual(0.0);
    });
});
//# sourceMappingURL=instruments.js.map