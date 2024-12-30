# WMS Parse Spike

A modern React application for parsing and displaying Web Map Service (WMS) capabilities documents. This tool helps developers and GIS professionals inspect WMS services by providing a clean, user-friendly interface for viewing service metadata, layer information, and legends.

## Features

- 🗺️ Parse WMS GetCapabilities XML documents
- 📋 Display comprehensive service metadata
- 📑 List available layers with detailed information
- 🖼️ Show layer legends with fallback handling
- 🔍 Filter layers by EPSG:3857 projection support
- ⚠️ Intelligent error handling with provider contact suggestions
- 📱 Responsive design for all device sizes

## Technical Stack

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite
- **XML Parsing**: Native DOMParser
- **HTTP Client**: Native Fetch API

## Architecture

The application follows a modular architecture with clear separation of concerns:

```
src/
├── components/           # React components
│   ├── LayerLegend.tsx  # Legend display with error handling
│   ├── LayerList.tsx    # Layer listing and display
│   ├── ServiceInfo.tsx  # Service metadata display
│   └── XMLParser.tsx    # Main parser component
├── types/               # TypeScript interfaces
├── utils/              
│   ├── styleParser.ts   # Style and legend parsing
│   ├── xmlParser.ts     # XML document parsing
│   └── xmlUtils.ts      # XML utility functions
└── main.tsx            # Application entry point
```

## Key Features

### Service Information
- Service name and title
- Abstract/description
- Keywords
- Contact information
- Access constraints and fees
- Provider details

### Layer Information
- Layer name and title
- Abstract/description
- Online resource URL
- Legend graphics
- EPSG:3857 projection support validation

### Error Handling
- HTTP error status messages
- WMS service exceptions
- Legend image loading failures
- Provider contact suggestions
- Friendly error messages for users

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Best Practices

- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Type Safety**: Full TypeScript implementation
- **Modularity**: Small, focused components and utility functions
- **Performance**: Efficient XML parsing and rendering
- **Accessibility**: Semantic HTML and ARIA attributes
- **Responsive**: Mobile-first design approach

## XML Parsing Details

The application handles various WMS XML structures:

### Service Metadata
```xml
<Service>
  <Name>WMS</Name>
  <Title>Service Title</Title>
  <Abstract>Service Description</Abstract>
  <KeywordList>
    <Keyword>keyword1</Keyword>
  </KeywordList>
  ...
</Service>
```

### Layer Information
```xml
<Layer>
  <Name>layer_name</Name>
  <Title>Layer Title</Title>
  <Abstract>Layer Description</Abstract>
  <CRS>EPSG:3857</CRS>
  <Style>
    <Name>style_name</Name>
    <LegendURL>
      <OnlineResource xlink:href="legend_url"/>
    </LegendURL>
  </Style>
</Layer>
```

## Usage Examples

1. **Basic Service Inspection**
   ```
   https://your-wms-server/wms?service=WMS&request=GetCapabilities
   ```

2. **Handling Service Exceptions**
   - Displays formatted error messages
   - Includes provider contact suggestions
   - Handles various HTTP status codes

3. **Legend Display**
   - Automatic fallback for unavailable legends
   - Handles AccessDenied exceptions
   - Supports various image formats

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - feel free to use this code in your own projects.