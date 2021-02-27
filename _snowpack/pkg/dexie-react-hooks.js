import { l as liveQuery } from './common/dexie-ba0521b0.js';
import { r as react } from './common/index-d0e3fe20.js';
import './common/_commonjsHelpers-eb5a497e.js';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

/** This file is copied from https://github.com/facebook/react/blob/master/packages/use-subscription/src/useSubscription.js
 * and updated by David Fahlander to also handle error callbacks by throwing the error in the renderer
 * so it can be caught by a react error boundrary.
 */
var useDebugValue = react.useDebugValue, useEffect = react.useEffect, useState = react.useState;
// Hook used for safely managing subscriptions in concurrent mode.
//
// In order to avoid removing and re-adding subscriptions each time this hook is called,
// the parameters passed to this hook should be memoized in some way–
// either by wrapping the entire params object with useMemo()
// or by wrapping the individual callbacks with useCallback().
function useSubscription(_a) {
    var 
    // (Synchronously) returns the current value of our subscription.
    getCurrentValue = _a.getCurrentValue, 
    // This function is passed an event handler to attach to the subscription.
    // It should return an unsubscribe function that removes the handler.
    subscribe = _a.subscribe;
    // Read the current value from our subscription.
    // When this value changes, we'll schedule an update with React.
    // It's important to also store the hook params so that we can check for staleness.
    // (See the comment in checkForUpdates() below for more info.)
    var _b = useState(function () { return ({
        getCurrentValue: getCurrentValue,
        subscribe: subscribe,
        value: getCurrentValue(),
        error: null
    }); }), state = _b[0], setState = _b[1];
    // If there is an error, throw it so that an Error Boundrary can catch it.
    if (state.error)
        throw state.error;
    var valueToReturn = state.value;
    // If parameters have changed since our last render, schedule an update with its current value.
    if (state.getCurrentValue !== getCurrentValue ||
        state.subscribe !== subscribe) {
        // If the subscription has been updated, we'll schedule another update with React.
        // React will process this update immediately, so the old subscription value won't be committed.
        // It is still nice to avoid returning a mismatched value though, so let's override the return value.
        valueToReturn = getCurrentValue();
        setState({
            getCurrentValue: getCurrentValue,
            subscribe: subscribe,
            value: valueToReturn,
            error: null
        });
    }
    // Display the current value for this hook in React DevTools.
    useDebugValue(valueToReturn);
    // It is important not to subscribe while rendering because this can lead to memory leaks.
    // (Learn more at reactjs.org/docs/strict-mode.html#detecting-unexpected-side-effects)
    // Instead, we wait until the commit phase to attach our handler.
    //
    // We intentionally use a passive effect (useEffect) rather than a synchronous one (useLayoutEffect)
    // so that we don't stretch the commit phase.
    // This also has an added benefit when multiple components are subscribed to the same source:
    // It allows each of the event handlers to safely schedule work without potentially removing an another handler.
    // (Learn more at https://codesandbox.io/s/k0yvr5970o)
    useEffect(function () {
        var didUnsubscribe = false;
        var checkForUpdates = function () {
            // It's possible that this callback will be invoked even after being unsubscribed,
            // if it's removed as a result of a subscription event/update.
            // In this case, React will log a DEV warning about an update from an unmounted component.
            // We can avoid triggering that warning with this check.
            if (didUnsubscribe) {
                return;
            }
            // We use a state updater function to avoid scheduling work for a stale source.
            // However it's important to eagerly read the currently value,
            // so that all scheduled work shares the same value (in the event of multiple subscriptions).
            // This avoids visual "tearing" when a mutation happens during a (concurrent) render.
            var value = getCurrentValue();
            setState(function (prevState) {
                // Ignore values from stale sources!
                // Since we subscribe an unsubscribe in a passive effect,
                // it's possible that this callback will be invoked for a stale (previous) subscription.
                // This check avoids scheduling an update for that stale subscription.
                if (prevState.getCurrentValue !== getCurrentValue ||
                    prevState.subscribe !== subscribe) {
                    return prevState;
                }
                // Some subscriptions will auto-invoke the handler, even if the value hasn't changed.
                // If the value hasn't changed, no update is needed.
                // Return state as-is so React can bail out and avoid an unnecessary render.
                if (prevState.value === value) {
                    return prevState;
                }
                return __assign(__assign({}, prevState), { value: value });
            });
        };
        var unsubscribe = subscribe(checkForUpdates, function (error) { return setState(function (prevState) { return (__assign(__assign({}, prevState), { error: error })); }); });
        // Because we're subscribing in a passive effect,
        // it's possible that an update has occurred between render and our effect handler.
        // Check for this and schedule an update if work has occurred.
        checkForUpdates();
        return function () {
            didUnsubscribe = true;
            unsubscribe();
        };
    }, [getCurrentValue, subscribe]);
    // Return the current value for our caller to use while rendering.
    return valueToReturn;
}

function useLiveQuery(querier, dependencies, defaultResult) {
    var _a = react.useState(defaultResult), lastResult = _a[0], setLastResult = _a[1];
    var subscription = react.useMemo(function () {
        // Make it remember previus subscription's default value when
        // resubscribing (á la useTransition())
        var currentValue = lastResult;
        var observable = liveQuery(querier);
        return {
            getCurrentValue: function () { return currentValue; },
            subscribe: function (onNext, onError) {
                var esSubscription = observable.subscribe(function (value) {
                    currentValue = value;
                    setLastResult(value);
                    onNext(value);
                }, onError);
                return esSubscription.unsubscribe.bind(esSubscription);
            }
        };
    }, 
    // Re-subscribe any time any of the given dependencies change
    dependencies || []);
    // The value returned by this hook reflects the current result from the querier
    // Our component will automatically be re-rendered when that value changes.
    var value = useSubscription(subscription);
    return value;
}

export { useLiveQuery };
