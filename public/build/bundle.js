
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.32.3' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/ATextbox.svelte generated by Svelte v3.32.3 */
    const file = "src/ATextbox.svelte";

    function create_fragment(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "class", "a-textbox svelte-fjuqyb");
    			attr_dev(input, "style", /*inputStyle*/ ctx[3]);
    			input.disabled = /*disabled*/ ctx[1];
    			toggle_class(input, "a-text--edit", !/*disabled*/ ctx[1]);
    			add_location(input, file, 46, 0, 904);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[0]);
    			/*input_binding*/ ctx[6](input);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[5]),
    					listen_dev(input, "input", handleInput, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*inputStyle*/ 8) {
    				attr_dev(input, "style", /*inputStyle*/ ctx[3]);
    			}

    			if (dirty & /*disabled*/ 2) {
    				prop_dev(input, "disabled", /*disabled*/ ctx[1]);
    			}

    			if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}

    			if (dirty & /*disabled*/ 2) {
    				toggle_class(input, "a-text--edit", !/*disabled*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			/*input_binding*/ ctx[6](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function handleInput(event) {
    	const newValue = event.target.value;
    	event.target.size = strLength(newValue);
    }

    function strLength(str) {
    	let count = 1;

    	for (let i = 0, len = str.length; i < len; i++) {
    		count += str.charCodeAt(i) < 256 ? 1 : 2;
    	}

    	return count;
    }

    function instance($$self, $$props, $$invalidate) {
    	let inputStyle;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ATextbox", slots, []);
    	let { disabled = false } = $$props;
    	let { value } = $$props;
    	let { fontSize = "1rem" } = $$props;
    	let inputElement;

    	onMount(e => {
    		$$invalidate(2, inputElement.size = strLength(value), inputElement);
    	});

    	const writable_props = ["disabled", "value", "fontSize"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ATextbox> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			inputElement = $$value;
    			$$invalidate(2, inputElement);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("disabled" in $$props) $$invalidate(1, disabled = $$props.disabled);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("fontSize" in $$props) $$invalidate(4, fontSize = $$props.fontSize);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		disabled,
    		value,
    		fontSize,
    		inputElement,
    		handleInput,
    		strLength,
    		inputStyle
    	});

    	$$self.$inject_state = $$props => {
    		if ("disabled" in $$props) $$invalidate(1, disabled = $$props.disabled);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("fontSize" in $$props) $$invalidate(4, fontSize = $$props.fontSize);
    		if ("inputElement" in $$props) $$invalidate(2, inputElement = $$props.inputElement);
    		if ("inputStyle" in $$props) $$invalidate(3, inputStyle = $$props.inputStyle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*fontSize*/ 16) {
    			$$invalidate(3, inputStyle = `font-size: ${fontSize}`);
    		}
    	};

    	return [
    		value,
    		disabled,
    		inputElement,
    		inputStyle,
    		fontSize,
    		input_input_handler,
    		input_binding
    	];
    }

    class ATextbox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { disabled: 1, value: 0, fontSize: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ATextbox",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*value*/ ctx[0] === undefined && !("value" in props)) {
    			console.warn("<ATextbox> was created without expected prop 'value'");
    		}
    	}

    	get disabled() {
    		throw new Error("<ATextbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<ATextbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<ATextbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<ATextbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fontSize() {
    		throw new Error("<ATextbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fontSize(value) {
    		throw new Error("<ATextbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/ATextarea.svelte generated by Svelte v3.32.3 */

    const file$1 = "src/ATextarea.svelte";

    function create_fragment$1(ctx) {
    	let textarea;
    	let textarea_style_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			textarea = element("textarea");
    			attr_dev(textarea, "style", textarea_style_value = `resize: ${/*disabled*/ ctx[1] ? "none" : "both"}`);
    			attr_dev(textarea, "class", "a-textarea svelte-187s29e");
    			textarea.disabled = /*disabled*/ ctx[1];
    			toggle_class(textarea, "a-textarea--edit", !/*disabled*/ ctx[1]);
    			add_location(textarea, file$1, 27, 0, 395);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, textarea, anchor);
    			set_input_value(textarea, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*disabled*/ 2 && textarea_style_value !== (textarea_style_value = `resize: ${/*disabled*/ ctx[1] ? "none" : "both"}`)) {
    				attr_dev(textarea, "style", textarea_style_value);
    			}

    			if (dirty & /*disabled*/ 2) {
    				prop_dev(textarea, "disabled", /*disabled*/ ctx[1]);
    			}

    			if (dirty & /*value*/ 1) {
    				set_input_value(textarea, /*value*/ ctx[0]);
    			}

    			if (dirty & /*disabled*/ 2) {
    				toggle_class(textarea, "a-textarea--edit", !/*disabled*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(textarea);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ATextarea", slots, []);
    	let { value } = $$props;
    	let { disabled = false } = $$props;
    	const writable_props = ["value", "disabled"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ATextarea> was created with unknown prop '${key}'`);
    	});

    	function textarea_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("disabled" in $$props) $$invalidate(1, disabled = $$props.disabled);
    	};

    	$$self.$capture_state = () => ({ value, disabled });

    	$$self.$inject_state = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("disabled" in $$props) $$invalidate(1, disabled = $$props.disabled);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, disabled, textarea_input_handler];
    }

    class ATextarea extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { value: 0, disabled: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ATextarea",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*value*/ ctx[0] === undefined && !("value" in props)) {
    			console.warn("<ATextarea> was created without expected prop 'value'");
    		}
    	}

    	get value() {
    		throw new Error("<ATextarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<ATextarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<ATextarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<ATextarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Card.svelte generated by Svelte v3.32.3 */
    const file$2 = "src/Card.svelte";

    function create_fragment$2(ctx) {
    	let div6;
    	let div2;
    	let div0;
    	let atextbox0;
    	let updating_value;
    	let t0;
    	let div1;
    	let atextbox1;
    	let updating_value_1;
    	let t1;
    	let div5;
    	let div3;
    	let atextbox2;
    	let updating_value_2;
    	let t2;
    	let div4;
    	let atextarea;
    	let updating_value_3;
    	let current;
    	let mounted;
    	let dispose;

    	function atextbox0_value_binding(value) {
    		/*atextbox0_value_binding*/ ctx[7](value);
    	}

    	let atextbox0_props = {
    		fontSize: "3rem",
    		disabled: !/*editable*/ ctx[4]
    	};

    	if (/*en*/ ctx[0] !== void 0) {
    		atextbox0_props.value = /*en*/ ctx[0];
    	}

    	atextbox0 = new ATextbox({ props: atextbox0_props, $$inline: true });
    	binding_callbacks.push(() => bind(atextbox0, "value", atextbox0_value_binding));

    	function atextbox1_value_binding(value) {
    		/*atextbox1_value_binding*/ ctx[8](value);
    	}

    	let atextbox1_props = { disabled: !/*editable*/ ctx[4] };

    	if (/*partOfSpeech*/ ctx[2] !== void 0) {
    		atextbox1_props.value = /*partOfSpeech*/ ctx[2];
    	}

    	atextbox1 = new ATextbox({ props: atextbox1_props, $$inline: true });
    	binding_callbacks.push(() => bind(atextbox1, "value", atextbox1_value_binding));

    	function atextbox2_value_binding(value) {
    		/*atextbox2_value_binding*/ ctx[10](value);
    	}

    	let atextbox2_props = {
    		fontSize: "3rem",
    		disabled: !/*editable*/ ctx[4]
    	};

    	if (/*tw*/ ctx[1] !== void 0) {
    		atextbox2_props.value = /*tw*/ ctx[1];
    	}

    	atextbox2 = new ATextbox({ props: atextbox2_props, $$inline: true });
    	binding_callbacks.push(() => bind(atextbox2, "value", atextbox2_value_binding));

    	function atextarea_value_binding(value) {
    		/*atextarea_value_binding*/ ctx[11](value);
    	}

    	let atextarea_props = {
    		fontSize: "0.8rem",
    		disabled: !/*editable*/ ctx[4]
    	};

    	if (/*example*/ ctx[3] !== void 0) {
    		atextarea_props.value = /*example*/ ctx[3];
    	}

    	atextarea = new ATextarea({ props: atextarea_props, $$inline: true });
    	binding_callbacks.push(() => bind(atextarea, "value", atextarea_value_binding));

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			create_component(atextbox0.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			create_component(atextbox1.$$.fragment);
    			t1 = space();
    			div5 = element("div");
    			div3 = element("div");
    			create_component(atextbox2.$$.fragment);
    			t2 = space();
    			div4 = element("div");
    			create_component(atextarea.$$.fragment);
    			attr_dev(div0, "class", "card__content card-depth svelte-d8ut61");
    			add_location(div0, file$2, 66, 2, 1342);
    			attr_dev(div1, "class", "card__content card-depth svelte-d8ut61");
    			add_location(div1, file$2, 73, 2, 1488);
    			attr_dev(div2, "class", "card__inner card__front svelte-d8ut61");
    			add_location(div2, file$2, 63, 2, 1258);
    			attr_dev(div3, "class", "card__content card-depth svelte-d8ut61");
    			add_location(div3, file$2, 83, 2, 1712);
    			attr_dev(div4, "class", "card__content card-depth svelte-d8ut61");
    			add_location(div4, file$2, 91, 2, 1871);
    			attr_dev(div5, "class", "card__inner card__back svelte-d8ut61");
    			add_location(div5, file$2, 80, 2, 1627);
    			attr_dev(div6, "class", "card svelte-d8ut61");
    			toggle_class(div6, "rotated", !/*isFront*/ ctx[5]);
    			add_location(div6, file$2, 62, 0, 1212);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div2);
    			append_dev(div2, div0);
    			mount_component(atextbox0, div0, null);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			mount_component(atextbox1, div1, null);
    			append_dev(div6, t1);
    			append_dev(div6, div5);
    			append_dev(div5, div3);
    			mount_component(atextbox2, div3, null);
    			append_dev(div5, t2);
    			append_dev(div5, div4);
    			mount_component(atextarea, div4, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div2, "click", /*click_handler*/ ctx[9], false, false, false),
    					listen_dev(div5, "click", /*click_handler_1*/ ctx[12], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const atextbox0_changes = {};
    			if (dirty & /*editable*/ 16) atextbox0_changes.disabled = !/*editable*/ ctx[4];

    			if (!updating_value && dirty & /*en*/ 1) {
    				updating_value = true;
    				atextbox0_changes.value = /*en*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			atextbox0.$set(atextbox0_changes);
    			const atextbox1_changes = {};
    			if (dirty & /*editable*/ 16) atextbox1_changes.disabled = !/*editable*/ ctx[4];

    			if (!updating_value_1 && dirty & /*partOfSpeech*/ 4) {
    				updating_value_1 = true;
    				atextbox1_changes.value = /*partOfSpeech*/ ctx[2];
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			atextbox1.$set(atextbox1_changes);
    			const atextbox2_changes = {};
    			if (dirty & /*editable*/ 16) atextbox2_changes.disabled = !/*editable*/ ctx[4];

    			if (dirty & /*$$scope*/ 8192) {
    				atextbox2_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value_2 && dirty & /*tw*/ 2) {
    				updating_value_2 = true;
    				atextbox2_changes.value = /*tw*/ ctx[1];
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			atextbox2.$set(atextbox2_changes);
    			const atextarea_changes = {};
    			if (dirty & /*editable*/ 16) atextarea_changes.disabled = !/*editable*/ ctx[4];

    			if (dirty & /*$$scope*/ 8192) {
    				atextarea_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value_3 && dirty & /*example*/ 8) {
    				updating_value_3 = true;
    				atextarea_changes.value = /*example*/ ctx[3];
    				add_flush_callback(() => updating_value_3 = false);
    			}

    			atextarea.$set(atextarea_changes);

    			if (dirty & /*isFront*/ 32) {
    				toggle_class(div6, "rotated", !/*isFront*/ ctx[5]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(atextbox0.$$.fragment, local);
    			transition_in(atextbox1.$$.fragment, local);
    			transition_in(atextbox2.$$.fragment, local);
    			transition_in(atextarea.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(atextbox0.$$.fragment, local);
    			transition_out(atextbox1.$$.fragment, local);
    			transition_out(atextbox2.$$.fragment, local);
    			transition_out(atextarea.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			destroy_component(atextbox0);
    			destroy_component(atextbox1);
    			destroy_component(atextbox2);
    			destroy_component(atextarea);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Card", slots, []);
    	let { editable = false } = $$props;
    	let { en = "" } = $$props;
    	let { tw = "" } = $$props;
    	let { partOfSpeech = "" } = $$props;
    	let { isFront = true } = $$props;
    	let { example = "" } = $$props;
    	const dispatcher = createEventDispatcher();
    	const writable_props = ["editable", "en", "tw", "partOfSpeech", "isFront", "example"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	function atextbox0_value_binding(value) {
    		en = value;
    		$$invalidate(0, en);
    	}

    	function atextbox1_value_binding(value) {
    		partOfSpeech = value;
    		$$invalidate(2, partOfSpeech);
    	}

    	const click_handler = e => dispatcher("click", e);

    	function atextbox2_value_binding(value) {
    		tw = value;
    		$$invalidate(1, tw);
    	}

    	function atextarea_value_binding(value) {
    		example = value;
    		$$invalidate(3, example);
    	}

    	const click_handler_1 = e => dispatcher("click", e);

    	$$self.$$set = $$props => {
    		if ("editable" in $$props) $$invalidate(4, editable = $$props.editable);
    		if ("en" in $$props) $$invalidate(0, en = $$props.en);
    		if ("tw" in $$props) $$invalidate(1, tw = $$props.tw);
    		if ("partOfSpeech" in $$props) $$invalidate(2, partOfSpeech = $$props.partOfSpeech);
    		if ("isFront" in $$props) $$invalidate(5, isFront = $$props.isFront);
    		if ("example" in $$props) $$invalidate(3, example = $$props.example);
    	};

    	$$self.$capture_state = () => ({
    		ATextbox,
    		ATextarea,
    		createEventDispatcher,
    		editable,
    		en,
    		tw,
    		partOfSpeech,
    		isFront,
    		example,
    		dispatcher
    	});

    	$$self.$inject_state = $$props => {
    		if ("editable" in $$props) $$invalidate(4, editable = $$props.editable);
    		if ("en" in $$props) $$invalidate(0, en = $$props.en);
    		if ("tw" in $$props) $$invalidate(1, tw = $$props.tw);
    		if ("partOfSpeech" in $$props) $$invalidate(2, partOfSpeech = $$props.partOfSpeech);
    		if ("isFront" in $$props) $$invalidate(5, isFront = $$props.isFront);
    		if ("example" in $$props) $$invalidate(3, example = $$props.example);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		en,
    		tw,
    		partOfSpeech,
    		example,
    		editable,
    		isFront,
    		dispatcher,
    		atextbox0_value_binding,
    		atextbox1_value_binding,
    		click_handler,
    		atextbox2_value_binding,
    		atextarea_value_binding,
    		click_handler_1
    	];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			editable: 4,
    			en: 0,
    			tw: 1,
    			partOfSpeech: 2,
    			isFront: 5,
    			example: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get editable() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set editable(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get en() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set en(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tw() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tw(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get partOfSpeech() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set partOfSpeech(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isFront() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isFront(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get example() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set example(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/AButton.svelte generated by Svelte v3.32.3 */
    const file$3 = "src/AButton.svelte";

    function create_fragment$3(ctx) {
    	let button;
    	let span;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			button = element("button");
    			span = element("span");
    			if (default_slot) default_slot.c();
    			attr_dev(span, "class", "a-btn__content svelte-10bq2q6");
    			add_location(span, file$3, 46, 2, 732);
    			attr_dev(button, "class", "a-btn svelte-10bq2q6");
    			toggle_class(button, "a-btn--dark", /*dark*/ ctx[0]);
    			add_location(button, file$3, 41, 0, 646);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, span);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*handleButtonClick*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, null, null);
    				}
    			}

    			if (dirty & /*dark*/ 1) {
    				toggle_class(button, "a-btn--dark", /*dark*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("AButton", slots, ['default']);
    	const dispatch = createEventDispatcher();
    	let { dark = false } = $$props;

    	function handleButtonClick(e) {
    		dispatch("click", e);
    	}

    	const writable_props = ["dark"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AButton> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("dark" in $$props) $$invalidate(0, dark = $$props.dark);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		dark,
    		handleButtonClick
    	});

    	$$self.$inject_state = $$props => {
    		if ("dark" in $$props) $$invalidate(0, dark = $$props.dark);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [dark, handleButtonClick, $$scope, slots];
    }

    class AButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { dark: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AButton",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get dark() {
    		throw new Error("<AButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dark(value) {
    		throw new Error("<AButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/CardMaker.svelte generated by Svelte v3.32.3 */
    const file$4 = "src/CardMaker.svelte";

    // (48:4) <AButton       dark       on:click={(e) => dispatcher('add-card', {         en,         tw,         partOfSpeech,         example       })}     >
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("ADD");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(48:4) <AButton       dark       on:click={(e) => dispatcher('add-card', {         en,         tw,         partOfSpeech,         example       })}     >",
    		ctx
    	});

    	return block;
    }

    // (59:4) <AButton dark on:click="{e => isFront = !isFront}">
    function create_default_slot(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("ROTATE");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(59:4) <AButton dark on:click=\\\"{e => isFront = !isFront}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div2;
    	let card;
    	let updating_partOfSpeech;
    	let updating_en;
    	let updating_tw;
    	let updating_example;
    	let t0;
    	let div0;
    	let abutton0;
    	let t1;
    	let div1;
    	let abutton1;
    	let current;

    	function card_partOfSpeech_binding(value) {
    		/*card_partOfSpeech_binding*/ ctx[6](value);
    	}

    	function card_en_binding(value) {
    		/*card_en_binding*/ ctx[7](value);
    	}

    	function card_tw_binding(value) {
    		/*card_tw_binding*/ ctx[8](value);
    	}

    	function card_example_binding(value) {
    		/*card_example_binding*/ ctx[9](value);
    	}

    	let card_props = {
    		isFront: /*isFront*/ ctx[0],
    		editable: true
    	};

    	if (/*partOfSpeech*/ ctx[3] !== void 0) {
    		card_props.partOfSpeech = /*partOfSpeech*/ ctx[3];
    	}

    	if (/*en*/ ctx[1] !== void 0) {
    		card_props.en = /*en*/ ctx[1];
    	}

    	if (/*tw*/ ctx[2] !== void 0) {
    		card_props.tw = /*tw*/ ctx[2];
    	}

    	if (/*example*/ ctx[4] !== void 0) {
    		card_props.example = /*example*/ ctx[4];
    	}

    	card = new Card({ props: card_props, $$inline: true });
    	binding_callbacks.push(() => bind(card, "partOfSpeech", card_partOfSpeech_binding));
    	binding_callbacks.push(() => bind(card, "en", card_en_binding));
    	binding_callbacks.push(() => bind(card, "tw", card_tw_binding));
    	binding_callbacks.push(() => bind(card, "example", card_example_binding));

    	abutton0 = new AButton({
    			props: {
    				dark: true,
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	abutton0.$on("click", /*click_handler*/ ctx[10]);

    	abutton1 = new AButton({
    			props: {
    				dark: true,
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	abutton1.$on("click", /*click_handler_1*/ ctx[11]);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			create_component(card.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			create_component(abutton0.$$.fragment);
    			t1 = space();
    			div1 = element("div");
    			create_component(abutton1.$$.fragment);
    			attr_dev(div0, "class", "my-1 card-maker__add-btn svelte-ritg9k");
    			add_location(div0, file$4, 46, 2, 815);
    			attr_dev(div1, "class", "card-maker__rotate-btn svelte-ritg9k");
    			add_location(div1, file$4, 57, 2, 1028);
    			attr_dev(div2, "class", "card-maker svelte-ritg9k");
    			add_location(div2, file$4, 37, 0, 639);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			mount_component(card, div2, null);
    			append_dev(div2, t0);
    			append_dev(div2, div0);
    			mount_component(abutton0, div0, null);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			mount_component(abutton1, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const card_changes = {};
    			if (dirty & /*isFront*/ 1) card_changes.isFront = /*isFront*/ ctx[0];

    			if (dirty & /*$$scope*/ 4096) {
    				card_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_partOfSpeech && dirty & /*partOfSpeech*/ 8) {
    				updating_partOfSpeech = true;
    				card_changes.partOfSpeech = /*partOfSpeech*/ ctx[3];
    				add_flush_callback(() => updating_partOfSpeech = false);
    			}

    			if (!updating_en && dirty & /*en*/ 2) {
    				updating_en = true;
    				card_changes.en = /*en*/ ctx[1];
    				add_flush_callback(() => updating_en = false);
    			}

    			if (!updating_tw && dirty & /*tw*/ 4) {
    				updating_tw = true;
    				card_changes.tw = /*tw*/ ctx[2];
    				add_flush_callback(() => updating_tw = false);
    			}

    			if (!updating_example && dirty & /*example*/ 16) {
    				updating_example = true;
    				card_changes.example = /*example*/ ctx[4];
    				add_flush_callback(() => updating_example = false);
    			}

    			card.$set(card_changes);
    			const abutton0_changes = {};

    			if (dirty & /*$$scope*/ 4096) {
    				abutton0_changes.$$scope = { dirty, ctx };
    			}

    			abutton0.$set(abutton0_changes);
    			const abutton1_changes = {};

    			if (dirty & /*$$scope*/ 4096) {
    				abutton1_changes.$$scope = { dirty, ctx };
    			}

    			abutton1.$set(abutton1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			transition_in(abutton0.$$.fragment, local);
    			transition_in(abutton1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			transition_out(abutton0.$$.fragment, local);
    			transition_out(abutton1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(card);
    			destroy_component(abutton0);
    			destroy_component(abutton1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CardMaker", slots, []);
    	let isFront = true;
    	let en = "Hello";
    	let tw = "你好";
    	let partOfSpeech = "n.";
    	let example = "example sentences";
    	const dispatcher = createEventDispatcher();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CardMaker> was created with unknown prop '${key}'`);
    	});

    	function card_partOfSpeech_binding(value) {
    		partOfSpeech = value;
    		$$invalidate(3, partOfSpeech);
    	}

    	function card_en_binding(value) {
    		en = value;
    		$$invalidate(1, en);
    	}

    	function card_tw_binding(value) {
    		tw = value;
    		$$invalidate(2, tw);
    	}

    	function card_example_binding(value) {
    		example = value;
    		$$invalidate(4, example);
    	}

    	const click_handler = e => dispatcher("add-card", { en, tw, partOfSpeech, example });
    	const click_handler_1 = e => $$invalidate(0, isFront = !isFront);

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		Card,
    		AButton,
    		isFront,
    		en,
    		tw,
    		partOfSpeech,
    		example,
    		dispatcher
    	});

    	$$self.$inject_state = $$props => {
    		if ("isFront" in $$props) $$invalidate(0, isFront = $$props.isFront);
    		if ("en" in $$props) $$invalidate(1, en = $$props.en);
    		if ("tw" in $$props) $$invalidate(2, tw = $$props.tw);
    		if ("partOfSpeech" in $$props) $$invalidate(3, partOfSpeech = $$props.partOfSpeech);
    		if ("example" in $$props) $$invalidate(4, example = $$props.example);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		isFront,
    		en,
    		tw,
    		partOfSpeech,
    		example,
    		dispatcher,
    		card_partOfSpeech_binding,
    		card_en_binding,
    		card_tw_binding,
    		card_example_binding,
    		click_handler,
    		click_handler_1
    	];
    }

    class CardMaker extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CardMaker",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    const cards = [];

    let db;

    const DB_VERSION = 3;

    const DB_NAME = 'Flashcard';

    function _init () {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = e => {
          console.error('init indexed db error');
          console.error(e.target.errorCode);
          reject(e);
        };
        request.onsuccess = e => {
          resolve(e.target.result);
        };

        request.onupgradeneeded = e => {
          db = e.target.result;
          console.log('indexed db upgradeneeded');
          const objectStore = db.createObjectStore('cards', { autoIncrement: true });
          console.log(objectStore);
        };
      
      })
    }

    function useDB (dbLoaded = () => {}) {
      onMount(async () => {
        db = await _init();
        dbLoaded();
      });

      onDestroy(() => {
        db.close();
      });

      const getAll = async () => {
        cards.length = 0;
        return new Promise((resolve, reject) => {
          const objectStore = _getObjectStore('cards');

          objectStore.openCursor().onsuccess = e => {
            const cursor = e.target.result;
            if (cursor) {
              cards.push({
                ...cursor.value,
                key: cursor.key
              });
              cursor.continue();
            } else {
              console.log('get all finish!', cards);
              resolve(cards);
            }
          };
        })
      };

      const _getObjectStore = table => db
        .transaction([table], 'readwrite')
        .objectStore(table);

      const deleteItem = async key => {
        return new Promise((resolve, reject) => {
          const objectStore = _getObjectStore('cards');
          const request = objectStore.delete(key);
          request.onsuccess = e => resolve(e);
          request.onerror = e => reject(e);
        })
      };

      const clearAll = async () => {
        return new Promise((resolve, reject) => {
          const objectStore = _getObjectStore('cards');
          const clearRequest = objectStore.clear();

          clearRequest.onsuccess = e => {
            resolve(e);
          };
          clearRequest.onerror = e => {
            reject(e);
          };
        })
      };

      const addItem = item => {
        return new Promise((resolve, reject) => {
          const objectStore = _getObjectStore('cards');
          const request = objectStore.add(item);
          request.onsuccess = e => resolve(e.target.result);
          request.onerror = e => reject(e);
        })
      };

      const addItems = insertedItems => {
        const objectStore = _getObjectStore('cards');
        for (let i in insertedItems) {
          let request = objectStore.add(insertedItems[i]);
          request.onsuccess = e => {
            resolve(e);
          };
        }
      };

      return {
        addItem,
        addItems,
        getAll,
        clearAll,
        deleteItem
      }
    }

    /* src/App.svelte generated by Svelte v3.32.3 */
    const file$5 = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    // (91:2) <AButton on:click={resetCardDBTable}>
    function create_default_slot$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Clear Card Table in DB");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(91:2) <AButton on:click={resetCardDBTable}>",
    		ctx
    	});

    	return block;
    }

    // (96:4) {#each vocabularies as vocabulary (vocabulary.key) }
    function create_each_block(key_1, ctx) {
    	let div;
    	let card;
    	let t0;
    	let button;
    	let t2;
    	let current;
    	let mounted;
    	let dispose;
    	const card_spread_levels = [/*vocabulary*/ ctx[10]];
    	let card_props = {};

    	for (let i = 0; i < card_spread_levels.length; i += 1) {
    		card_props = assign(card_props, card_spread_levels[i]);
    	}

    	card = new Card({ props: card_props, $$inline: true });

    	card.$on("click", function () {
    		if (is_function(/*rotateCard*/ ctx[4](/*vocabulary*/ ctx[10]))) /*rotateCard*/ ctx[4](/*vocabulary*/ ctx[10]).apply(this, arguments);
    	});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(card.$$.fragment);
    			t0 = space();
    			button = element("button");
    			button.textContent = "x";
    			t2 = space();
    			attr_dev(button, "class", "card__cancel-btn svelte-ogdi1b");
    			add_location(button, file$5, 100, 8, 2172);
    			attr_dev(div, "class", "card__wrapper svelte-ogdi1b");
    			add_location(div, file$5, 96, 6, 2044);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(card, div, null);
    			append_dev(div, t0);
    			append_dev(div, button);
    			append_dev(div, t2);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*removeCard*/ ctx[3](/*vocabulary*/ ctx[10]))) /*removeCard*/ ctx[3](/*vocabulary*/ ctx[10]).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			const card_changes = (dirty & /*vocabularies*/ 1)
    			? get_spread_update(card_spread_levels, [get_spread_object(/*vocabulary*/ ctx[10])])
    			: {};

    			card.$set(card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(card);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(96:4) {#each vocabularies as vocabulary (vocabulary.key) }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let main;
    	let abutton;
    	let t0;
    	let h20;
    	let t2;
    	let cardmaker;
    	let t3;
    	let h21;
    	let t5;
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;

    	abutton = new AButton({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	abutton.$on("click", /*resetCardDBTable*/ ctx[2]);
    	cardmaker = new CardMaker({ $$inline: true });
    	cardmaker.$on("add-card", /*addCard*/ ctx[1]);
    	let each_value = /*vocabularies*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*vocabulary*/ ctx[10].key;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(abutton.$$.fragment);
    			t0 = space();
    			h20 = element("h2");
    			h20.textContent = "Add Card";
    			t2 = space();
    			create_component(cardmaker.$$.fragment);
    			t3 = space();
    			h21 = element("h2");
    			h21.textContent = "Cards";
    			t5 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h20, "class", "title svelte-ogdi1b");
    			add_location(h20, file$5, 91, 2, 1849);
    			attr_dev(h21, "class", "title svelte-ogdi1b");
    			add_location(h21, file$5, 93, 2, 1920);
    			attr_dev(div, "class", "card__container svelte-ogdi1b");
    			add_location(div, file$5, 94, 2, 1951);
    			add_location(main, file$5, 89, 0, 1768);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(abutton, main, null);
    			append_dev(main, t0);
    			append_dev(main, h20);
    			append_dev(main, t2);
    			mount_component(cardmaker, main, null);
    			append_dev(main, t3);
    			append_dev(main, h21);
    			append_dev(main, t5);
    			append_dev(main, div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const abutton_changes = {};

    			if (dirty & /*$$scope*/ 8192) {
    				abutton_changes.$$scope = { dirty, ctx };
    			}

    			abutton.$set(abutton_changes);

    			if (dirty & /*removeCard, vocabularies, rotateCard*/ 25) {
    				each_value = /*vocabularies*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block, null, get_each_context);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(abutton.$$.fragment, local);
    			transition_in(cardmaker.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(abutton.$$.fragment, local);
    			transition_out(cardmaker.$$.fragment, local);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(abutton);
    			destroy_component(cardmaker);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let vocabularies = [];

    	async function addCard({ detail: vocabulary }) {
    		const key = await addItem(vocabulary);
    		vocabularies.push({ ...vocabulary, isFront: true, key });
    		$$invalidate(0, vocabularies);
    	}

    	async function resetCardDBTable() {
    		await clearAll();
    		$$invalidate(0, vocabularies = []);
    	}

    	function removeCard(vocabulary) {
    		const index = vocabularies.indexOf(vocabulary);
    		const isIndexExists = index !== -1;
    		isIndexExists && vocabularies.splice(index, 1);
    		$$invalidate(0, vocabularies);
    		deleteItem(vocabulary.key);
    	}

    	function rotateCard(vocabulary) {
    		vocabulary.isFront = !vocabulary.isFront;
    		$$invalidate(0, vocabularies = vocabularies); // svelte need to reload array
    	}

    	function initVocabulary() {
    		$$invalidate(0, vocabularies = vocabularies.map(vocabuary => ({ ...vocabuary, isFront: true })));
    	}

    	const { addItem, getAll, clearAll, deleteItem } = useDB(async () => {
    		$$invalidate(0, vocabularies = await getAll());
    		initVocabulary();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Card,
    		CardMaker,
    		useDB,
    		AButton,
    		vocabularies,
    		addCard,
    		resetCardDBTable,
    		removeCard,
    		rotateCard,
    		initVocabulary,
    		addItem,
    		getAll,
    		clearAll,
    		deleteItem
    	});

    	$$self.$inject_state = $$props => {
    		if ("vocabularies" in $$props) $$invalidate(0, vocabularies = $$props.vocabularies);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [vocabularies, addCard, resetCardDBTable, removeCard, rotateCard];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
