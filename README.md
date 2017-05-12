# KxFoxxWeb

Arangodb's Foxx-based CRUDe cms


## Middleware
- `lib/middleware-template`
  - Handlebars Templating
  - Response.view(pageFileOr$PagesDocument, data, layoutFileOr$ContentDocumentByName)
    - *pageFileOr$PagesDocument*
      - pageFile ending in `.html` inside `views/` 
      - OR Pages document (`_key` = `page-name`) with `content` (and or) `data` attribute;
        - `data` attribute will be available as {{$local.ATTRIBUTE}}
    - *layoutFileOr$ContentDocumentByName*
      - layoutFile ending in `.html` inside `views/layouts` (must have `{{{content}}}` )
      - OR Contents document with `type` = `layout` and `content` attribute
        - available `data` in layout can come from  `models/global.json` (and or) Contents document with `type=data` and `name=global`

## Routes
- `homepage` _(default /)_

## Collection and Document
- Contents: _requires `type` and `name`_
- Pages _`_key` as page-name, and DO NOT auto-generated;_
- Users

# License

Copyright (c) 2017 Copongcopong

License: whatever