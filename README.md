# Vuesializer

Vuesializer is a Vue 3 package for creating sleek and customizable visualizations for your media content. This lightweight component makes it easy to integrate beautiful, responsive designs into your projects. You can see it in action [Here](https://yaztak.github.io/Vuesializer/)

## Features

- **Customizable**: Adjust colors, stroke width, and other styling properties easily.
- **Responsive Design**: Adapts seamlessly to various container sizes.
- **Lightweight**: Minimal setup required with optimized performance.
- **Modern Aesthetics**: Styled using CSS variables for flexibility and consistency.

## Installation

Install the package via npm:

```bash
npm install vuesializer
```

## Usage

Here’s how to integrate Vuesializer into your Vue 3 application:

```vue
<template>
  <Vuesializer
    :src="audioSource"
    height="200px"
    :colors="['#FF5733', '#33FF57', '#3357FF']"
    strokeColor="rgba(255, 255, 0, 0.8)"
    :strokeWidth="2"
  />
</template>

<script>
import Vuesializer from "vuesializer";

export default {
  components: { Vuesializer },
  data() {
    return {
      audioSource: "path/to/your/audio/file.mp3",
    };
  },
};
</script>
```

## Props

| Prop Name     | Type   | Default Value            | Required | Description                                  |
| ------------- | ------ | ------------------------ | :------: | -------------------------------------------- |
| `src`         | String | -                        |    ✅    | The source file path for the audio or media. |
| `height`      | String | `"100%"`                 |    ❌    | Sets the height of the visualization.        |
| `colors`      | Array  | `[]`                     |    ❌    | Defines the color palette for the visuals.   |
| `strokeColor` | String | `"rgba(0, 191, 179, 1)"` |    ❌    | The color of the visualization stroke.       |
| `strokeWidth` | Number | `1`                      |    ❌    | The width of the visualization stroke.       |

## Styling

Vuesializer uses CSS variables to provide extensive styling options. Below are the available variables and their default values:

| Variable Name     | Default Value                                                               | Description                                           |
| ----------------- | --------------------------------------------------------------------------- | ----------------------------------------------------- |
| `--height`        | `100%`                                                                      | Sets the height of the Vuesializer component.         |
| `--btn-bg`        | `rgb(255, 255, 255)`                                                        | Background color of the play button.                  |
| `--btn-color`     | `rgb(127, 127, 127)`                                                        | Color of the play button's icon.                      |
| `--btn-shadow`    | `0 3px 10px rgba(127, 127, 127, 0.25), 0 7px 20px rgba(127, 127, 127, 0.1)` | Shadow styling for the play button.                   |
| `--btn-width`     | `60px`                                                                      | Width of the play button.                             |
| `--btn-height`    | `60px`                                                                      | Height of the play button.                            |
| `--btn-radius`    | `50%`                                                                       | Border-radius of the play button, making it circular. |
| `--btn-border`    | `none`                                                                      | Border styling for the play button.                   |
| `--btn-icon-size` | `34px`                                                                      | Font size of the play button's icon.                  |

To customize the styles, you can override these variables in your CSS file. Here's an example:

```css
.Vuesializer {
  --btn-bg: rgb(0, 0, 0);
  --btn-color: rgb(255, 255, 255);
  --btn-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}
```

## Contributing

We welcome contributions! Feel free to fork this repository and submit a pull request.

## License

Vuesializer is licensed under the [MIT License](LICENSE).
