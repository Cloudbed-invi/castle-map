# SunFire Castle Map Editor

An interactive, responsive diamond-grid map editor built with React and Vite. It allows you to create fully customizable maps, add floating text, save your progress to a shareable URL, upload directly to ImgBB, and export high-quality images.

## Features

- **Interactive Diamond Grid**: Paint and erase cells with a custom color palette.
- **Customizable Borders**: Dynamic grid lines that adapt to dark colors (e.g., black cells get red borders).
- **Floating Labels**: Add Canva-style draggable, rotatable, and resizable text anywhere on the map.
- **Title & Legend**: Beautifully integrated Map Title and Subtitle, plus an auto-generated Export Legend.
- **State Persistence**: Your work is automatically saved to your browser's local storage.
- **URL Sharing**: Generate a highly compressed, shareable URL so you can send your map to anyone. Private URL shortening is supported via Bitly.
- **1-Click ImgBB Upload**: Enter your ImgBB API key to seamlessly upload your map picture and get a direct link.
- **Local Image Export**: Export your map and legend as a high-quality PNG.

## Instructions / How to Use

1. **Painting the Map**:
   - Use the **Show Tools** button to open the Paint Toolbar.
   - Click any color in "Add to Palette" to add it to your Active Colors.
   - Select an Active Color, then **click and drag** over the diamond grid to paint multiple cells quickly!
   - To erase, simply paint over an already colored cell with the same active color.

2. **Customizing the Legend**:
   - Open **⚙️ Settings** to assign labels to your colors (e.g. "Team A", "Main Base").
   - Any unassigned colors are automatically hidden from the final exported image.
   - You can completely remove a color from your palette by clicking the red **×**.

3. **Floating Text Labels**:
   - In Settings, scroll to the **Floating Texts** section and click **Add New Text Label**.
   - You can drag the label anywhere on the map. 
   - To **delete** a label from the map, click on it (it will highlight with a blue dashed box) and press the **Delete** or **Backspace** key.

4. **Saving & Sharing**:
   - **Auto-save**: Your progress is automatically saved to your local browser! You won't lose it if you close the tab.
   - **🔗 Share Link**: Generates a URL that contains your exact map layout. You can share this link with anyone. 
   - **API Integrations**: In Settings, you can enter a Bitly API Key to generate short URLs, or an ImgBB API Key to instantly upload the map to the web.

## Development

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Build for production
npm run build
```

## License

MIT
