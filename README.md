# Castle Map Editor

An interactive, responsive diamond-grid map editor built with React and Vite. It allows you to create fully customizable maps, add floating text, save your progress to a shareable URL, upload directly to ImgBB, and export high-quality images.

## Features

- **Interactive Diamond Grid**: Paint and erase cells with a custom color palette.
- **Customizable Borders**: Dynamic grid lines that adapt to dark colors (e.g., black cells get red borders).
- **Floating Labels**: Add Canva-style draggable, rotatable, and resizable text anywhere on the map.
- **Title & Legend**: Beautifully integrated Map Title and Subtitle, plus an auto-generated Export Legend.
- **State Persistence**: Your work is automatically saved to your browser's local storage.
- **URL Sharing**: Generate a highly compressed, shareable URL so you can send your map to anyone.
- **1-Click ImgBB Upload**: Enter your ImgBB API key to seamlessly upload your map picture and get a direct link.
- **Local Image Export**: Export your map and legend as a high-quality PNG.

## Development

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Build for production
npm run build
```

## Deployment

This project is configured to automatically deploy to GitHub Pages via GitHub Actions when pushing to the `main` or `master` branch.

## License

MIT
