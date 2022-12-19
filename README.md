# Am I Overreacting? Or is React Over-Reacting?

When I first started doing web development, it was primarily with Python/Django.  Everything was server side rendered and not once did I ever think about "rendering performance".  10 years later and with computers at least twice as fast rendering performance is still somehow an issue.  Single Page Apps (SPAs) and frontend libraries like React have taken over and encouraged and enabled highly dynamic web pages.  Unfortunately, in my experience, the default recommended way to write React code does not actually support this very well.  After several years of fighting with React, I'm pretty ready to throw in the towel.  In this post I will explore the problems that come with standard React code, the recommended options for improving React performance, and finally counter these with examples in vanilla JS.

## What We're Building

Coming up with a succinct example is difficult as it is really the complexities of a real project that better demonstrate how everything comes together.  However, I think it should be possible to see even from these simple examples the problems that arise.

As mentioned at the start, this post is mostly focused on highly dynamic web pages.  As such, the example we will go over is a drag and drop interface with some very basic functionality to demonstrate the issues that arise.

## Initialize project using Create React App

```
npx create-react-app react-overreact --template typescript
```

## Hover Element State

In this first example, we will capture the current hovered element as state and use this to update the background color of the element. Before you raise your pitchforks and say that this could simply be done with a CSS `:hover`, imagine that this hover state is needed for something else and we are just using the `backgroundColor` property as a way to visualize the state change.

### Naive React Solution

![Profiling Screenshot](/images/react-naive-hover.png)

On an M1 Macbook Pro a single render clocks in at between 3ms and 9ms.  You can also see that every time a new element is hovered a new render is triggered.  If you're thinking under 10ms sounds pretty fast, please remember that the M1 chip is one of the fastest single threaded performing CPUs currently available.  It's easy to imagine that there would be older devices that could be at least twice as slow.  This is also all with the simplest text element one could ever imagine.  Even just a few more elements inside the repeated element would start scaling even more poorly.

I would like to acknowledge that there should be "some" overhead from using the development build, but I wouldn't expect turning on production mode would have a substantial impact on this example, and will likely follow up with numbers to show this.

I come from a gaming development background where it is ingrained in you that your frame needs to complete all processing in under 16ms in order to maintain 16 frames per second.  With just 500 elements I have nearly passed this threshold already with React.  Once a frame takes more than 16ms, the stutter becomes noticeable and renders get queued up leading to a horrendous user experience.

See the code below for what this looks like.

```ts
// App.tsx
import React, { useState } from "react";
import "./App.css";

function App() {
  const [hoveredElementId, setHoveredElementId] = useState("");

  const elements = [];

  for (let i = 0; i < 500; i++) {
    const elementId = String(i);
    const isHovered = hoveredElementId === elementId;

    elements.push(
      <div 
        key={i}
        style={{ marginBottom: 8, backgroundColor: isHovered ? "#eee" : "" }}
        onMouseEnter={() => {
          setHoveredElementId(elementId);
        }}
        onMouseLeave={()=> {
          if (elementId == hoveredElementId) {
            setHoveredElementId("");
          }
        }}
      >
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </div>
    );
  }

  return <>{elements}</>;
}

export default App;
```

### Optimizing Performance in React

On React's [Optimizing Performance page](https://reactjs.org/docs/optimizing-performance.html), they claim "For many applications, using React will lead to a fast user interface without doing much work to specifically optimize for performance."  In my opinion, this should be re-worded as "most applications won't have enough elements to worry about React's default excessive rendering".

One of the first suggestions in this list is [Virualize Long Lists](https://reactjs.org/docs/optimizing-performance.html#virtualize-long-lists).  Per their docs: "If your application renders long lists of data (hundreds or thousands of rows), we recommend using a technique known as “windowing”".  This makes sense in the realm of an infinite list, but in the low 100s of elements, this is an unnecessary complication to add on top of things. In the real world example I was working with that led to this article there were highly nested components, which means that sometimes a single element was quite simple, and other times a single element could have several other components.  Windowing with this would require computing the dynamic height of every single element probably leading to even worse performance than just showing all of the elements in the first place.

The next example suggests [Avoid Reconciliation](https://reactjs.org/docs/optimizing-performance.html#avoid-reconciliation). Essentially suggesting to update the component so that if the props haven't change don't render the component.  When I first learned this I had to do a double take.  I thought the entire point of React was that if the props didn't change then there's no work to be done in a component.  But turns out React just blindly re-renders the entire subtree if a prop of a parent changes.

Remember that helpful page that suggested this?  Well none of it actually tells you how to do this with functional components.  The only page on the react website devoted to Performance Optimizations doesn't bother to give you any information about how to optimize using hooks (which is now the recommended way of using React).  Instead, details about hook optimizations is buried in the [Hooks FAQs](https://reactjs.org/docs/hooks-faq.html#performance-optimizations).

First we pull the inner element into it's own React component in order to benefit from the ability to prevent re-renders.  Functionally this should be pretty much the same.  The profiler shows us we're now at 4ms - 16ms.  That last number should look familiar...we're already teetering into dipping below 60fps.

![](/images/react-separate-component.png)

The code below still triggers a full render every time the hovered element id changes.  This is because we are passing in the `hoveredElementId` to the element and therefore each child's props are changing.  We have a couple of options for how to fix this.  An element only needs to re-render if the `hoveredElementId` is the current element (in which case we need to update the backgroundColor), or the previous hoveredElementId was the current element (in which case we need to remove the backgroundColor style).

Option 1:



```ts
import React, { useState } from "react";
import "./App.css";

type ElementProps = {
  id: string;
  hoveredElementId: string;
  onMouseEnter: (id: string) => void;
  onMouseLeave: (id: string) => void;
};

function Div(props: ElementProps) {
  const isHovered = props.hoveredElementId === props.id;

  return (
    <div
      style={{ marginBottom: 8, backgroundColor: isHovered ? "#eee" : "" }}
      onMouseEnter={() => {
        props.onMouseEnter(props.id);
      }}
      onMouseLeave={() => {
        props.onMouseLeave(props.id);
      }}
    >
      div
    </div>
  );
}

function App() {
  const [hoveredElementId, setHoveredElementId] = useState("");

  const handleMouseEnter = (id: string) => {
    setHoveredElementId(id);
  };

  const handleMouseLeave = (id: string) => {
    if (id == hoveredElementId) {
      setHoveredElementId("");
    }
  };

  const elements = [];

  for (let i = 0; i < 500; i++) {
    elements.push(
      <Div
        key={i}
        id={String(i)}
        hoveredElementId={hoveredElementId}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
    );
  }

  return <>{elements}</>;
}

export default App;
```

Below is the updated code required to prevent a full re-render on every single element when an element is hovered.

## Resources

https://reactjs.org/docs/optimizing-performance.html