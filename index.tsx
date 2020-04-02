// Poor man's React

//JSX and Virtual DOM
let React = {
    createElement: (tag, props, ...children) => {
        if (typeof tag === 'function') {
            try {
                return tag(props);
            } catch ({ promise, key }) {
                promise.then(data => {
                    promiseChache.set(key, data);
                    rerender();
                })
                return {
                    tag: 'h1',
                    props: { children: ['I AM LOADING'] }
                }
            }
        }
        const element = { tag, props: { ...props, children } }
        console.log(element);
        return element;
    }
};

// Component's state stack
const states = [];
// State pointer
let stateCursor = 0;

// Hooks
const useState = (initialState) => {
    const FROZENCURSOR = stateCursor;
    states[FROZENCURSOR] = states[FROZENCURSOR] || initialState;
    const setState = (newState) => {
        states[FROZENCURSOR] = newState;
        rerender();
    }
    stateCursor++;
    return [states[FROZENCURSOR], setState]
}

// Concurent Mode (Experimental)
const promiseChache = new Map();

const createResource = (thingThatReturnsASomething, key) => {
    if (promiseChache.has(key)) {
        return promiseChache.get(key);
    }
    throw { promise: thingThatReturnsASomething, key }
};

// Component
const App = () => {
    const [name, setName] = useState('John Doe');
    const [count, setCount] = useState(0);

    const dogPhotoUrl = createResource(fetch('https://dog.ceo/api/breeds/image/random').then(
        r => r.json()
    ).then(payload => payload.message),
        'dogPhoto'
    );
    return (
        <div classname="my-react">
            <input value={name} onchange={(e) => setName(e.target.value)} type="text" placeholder="name" />
            <h1>Hello, {name}</h1>
            <p>Lorem ipsum dolor sit amet consectetur</p>
            <button onclick={() => setCount(count + 1)}>Increase</button>
            <button onclick={() => setCount(count - 1)}>Decrease</button>
            <h2>The count is: {count}</h2>
            <img alt="Good Boy" src={dogPhotoUrl}/>
        </div>)
};

// Render => map Virtual DOM to the actual DOM
const render = (reactElementOrStringOrNumber, container) => {
    if (['string', 'number'].includes(typeof (reactElementOrStringOrNumber))) {
        container.appendChild(document.createTextNode(String(reactElementOrStringOrNumber)))
        return;
    }
    const actualDomElement = document.createElement(reactElementOrStringOrNumber.tag)
    if (reactElementOrStringOrNumber.props) {
        Object.keys(reactElementOrStringOrNumber.props).filter(p => p !== 'children').forEach(p => actualDomElement[p] = reactElementOrStringOrNumber.props[p])
    };

    if (reactElementOrStringOrNumber.props.children) {
        reactElementOrStringOrNumber.props.children.forEach(child => render(child, actualDomElement))
    };

    container.appendChild(actualDomElement);
}

// Rerender cleanup
const rerender = () => {
    stateCursor = 0;
    document.querySelector('#app').firstChild.remove();
    render(<App />, document.querySelector('#app'));
}

render(<App />, document.querySelector('#app'));