# Australia Map Travel Journal

A web application for mapping and journaling places visited in Australia. Users can add pins to a map, upload photos and videos for each location, and interactively explore their travel history.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
  - [Tech Stack](#tech-stack)
  - [Directory Structure](#directory-structure)
  - [Component Overview](#component-overview)
- [How It Works](#how-it-works)
  - [Map Interaction](#map-interaction)
  - [Pin Management](#pin-management)
  - [Media Upload](#media-upload)
- [Development Workflow](#development-workflow)
  - [Setup](#setup)
  - [Scripts](#scripts)
  - [Adding Features](#adding-features)
- [Blogs](#blogs)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Project Overview

This application allows users to:

- View a zoomable, interactive map of Australia.
- Add pins to mark places they have visited.
- Attach photos and videos to each pin.
- View media in a popup by clicking on a pin.

The project is built with **React**, **TypeScript**, **TailwindCSS**, and **Bun** for fast development and modern best practices.

---

## Blogs

The project includes a section for blogs, allowing you to add, organize, and display travel stories or articles related to your journeys.

- **Directory:** `src/blogs/`
- **Usage:** Place your Markdown or text files for each blog post in this directory. You can extend the application to read and render these files as blog entries within the UI.
- **Example:**  
  - `src/blogs/my-first-trip.md`
  - `src/blogs/sydney-adventures.md`

You may implement a blog listing or viewer component to display these posts in the app.

---

## Architecture

### Tech Stack

- **Frontend Framework:** React 18 (with functional components and hooks)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Map Engine:** Leaflet (via react-leaflet)
- **Bundler/Runtime:** Bun
- **State Management:** React local state (can be extended)
- **Media Storage:** In-memory (browser session); can be extended to persistent storage

### Directory Structure

```
build/
├── src/
│   ├── components/
│   │   ├── MapView.tsx
│   │   └── PinPopup.tsx
│   ├── App.tsx
│   ├── index.tsx
│   ├── index.css
│   └── types.ts
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── bunfig.toml
```

### Component Overview

- **App.tsx**  
  Root component. Manages the global state for pins and orchestrates the main logic.

- **components/MapView.tsx**  
  Renders the Leaflet map, handles map events (clicks for adding pins), and displays all pins.

- **components/PinPopup.tsx**  
  Renders the popup for each pin, including media previews and upload controls.

- **types.ts**  
  TypeScript interfaces for pins and media objects.

---

## How It Works

### Map Interaction

- The map is rendered using `react-leaflet`, centered on Australia.
- Users can zoom and pan within the bounds of Australia.
- Clicking on the map prompts the user to enter a place name, then adds a pin at the clicked location.

### Pin Management

- Pins are stored in React state as an array of objects, each containing:
  - Coordinates (`[lat, lng]`)
  - Place name
  - Array of media objects (photos/videos)
- Pins are rendered as markers on the map.
- Clicking a marker opens a popup with details and media.

### Media Upload

- Each pin's popup includes a button to upload images or videos.
- Uploaded files are previewed in the popup.
- Files are stored as object URLs in memory (not persisted after page reload).

---

## Development Workflow

### Setup

1. **Install Bun:**  
   [https://bun.sh/docs/installation](https://bun.sh/docs/installation)

2. **Install dependencies:**  
   ```
   bun install
   ```

3. **Build Tailwind CSS:**  
   ```
   npx tailwindcss -i ./src/index.css -o ./src/tailwind.output.css --watch
   ```
   Or use the provided scripts.

4. **Start the development server:**  
   ```
   bun run dev
   ```

### Scripts

- `bun run dev` — Runs Tailwind in watch mode and starts the React app.
- `bun run build` — Builds Tailwind CSS and the React app for production.

### Adding Features

- **Persistent Storage:**  
  To persist pins and media, integrate `localStorage`, IndexedDB, or a backend API.
- **Authentication:**  
  Add user authentication for personalized travel journals.
- **Cloud Media Storage:**  
  Integrate with cloud storage (e.g., AWS S3, Firebase) for media persistence.

---

## Best Practices

- Use TypeScript interfaces from `types.ts` for all pin and media data.
- Keep UI logic in components; avoid business logic in the view layer.
- Use Tailwind utility classes for styling; avoid custom CSS unless necessary.
- For large features, create new components in `src/components/`.

---

## Troubleshooting

- **Map not displaying:**  
  Ensure Leaflet CSS is imported in `MapView.tsx`.
- **Media not uploading:**  
  Check browser permissions and file type restrictions.
- **TypeScript errors:**  
  Run `bun run build` to see type errors and fix them as needed.

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

## Contact

For questions or contributions, please open an issue or pull request on the repository.
