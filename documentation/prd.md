# Background

The goal of this project is to build a framework-agnostic panel to assist with SEO and anlytics debuging that can be used on any website. This package should be publicly available on npm to be consumed by front-end frameworks like React, Vue, and Svelte. It should also be available as a script tag served by a CDN to be used in any HTML file. The panel will be used in local development and staging environments not in production environments.

## Core Experience

There will be a button that is fixed to the bottom right of the screen. When clicked, it will open a panel that is fixed to the right of the screen. The panel will be used to display SEO and analytics information about the current page.

## Core Features

- A list of all headings on the page in their respective order allowing the user to see the document structure and ensure that each heading is present and has the correct hierarchy.
- A list of all images on the page with their respective alt text, loading strategy, size, and source.
- A list of all links both external and internal on the page with their respective text and destination.
- A list of all internal links on the page with their respective text and destination.
- A list of all scripts on the page with their respective text and destination and load times.
- A list of all meta tags and open graph tags on the page including the title, description, and OG image.

## Future Ideas

- I want to add a way to see tracking events on the page and the payloads of those events. Many teams use tools like Segment, Rudderstack, or GTM, I want to see each event and the payload of that event to help users debug issues with their tracking tools.
