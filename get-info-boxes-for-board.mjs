import * as fs from 'node:fs';
import * as path from 'node:path';

import playwright from 'playwright';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath( import.meta.url );
const __dirname = path.dirname( __filename );

const BOARD_ID_PLACEHOLDER = '[BOARD ID]';
const COLLABORATION_BOX_PLACEHOLDER = '[COLLABORATION BOX PLACEHOLDER]';
const CURSOR_PLACEHOLDER = '[CURSOR]';

const GET_ITEM_IDS_INITIAL_QUERY = `query {
  boards(ids: ${ BOARD_ID_PLACEHOLDER }) {
    name
    items_page{
      cursor
      items {
        id
        name
      }
    }
  }
}`;
const GET_ITEM_IDS_NEXT_PAGE_QUERY = `query {
  next_items_page (cursor: "${ CURSOR_PLACEHOLDER }") {
    cursor
    items {
      id
      name
    }
  }
}
`;

const COLLABORATION_BOX_URL = `https://nyu-lib.monday.com/projects/${ COLLABORATION_BOX_PLACEHOLDER }/collaboration_boxes.json`
const MONDAY_COM_API_URL = 'https://api.monday.com/v2/';

// Collaboration box JSON files written to this output directory
const COLLABORATION_BOX_FILES_DIR = path.join( __dirname, 'collaboration-box-files' );

// Playwright
const DEFAULT_TIMEOUT = 30_000;
let browser;
let page;

async function fetchInfoBoxes( itemIds, outputDir ) {
    for ( let i = 0; i < itemIds.length; i++ ) {
        const itemId = itemIds[ i ];
        const url = COLLABORATION_BOX_URL.replaceAll( COLLABORATION_BOX_PLACEHOLDER, itemId );

        try {
            const response = await page.goto( url );
            const responseObject = await response.json();
            fs.writeFileSync(
                path.join( outputDir, `${ itemId }.json` ),
                JSON.stringify( responseObject, null, '    ' ),
                { encoding: 'utf8' },
            );
        } catch ( e ) {
            console.error( e );
        }
    }
}

async function getItemIdsForBoard( boardId ) {
    const itemIds = [];

    const initialQuery = GET_ITEM_IDS_INITIAL_QUERY.replaceAll( BOARD_ID_PLACEHOLDER, boardId );
    let queryResults = await getQueryResults( initialQuery );
    itemIds.push( ...queryResults.itemIds );

    while ( queryResults.cursor ) {
        const nextPageQuery = GET_ITEM_IDS_NEXT_PAGE_QUERY.replaceAll( CURSOR_PLACEHOLDER, queryResults.cursor );
        queryResults = await getQueryResults( nextPageQuery );
        itemIds.push( ...queryResults.itemIds );
    }

    return itemIds;
}

async function getQueryResults( query ) {
    const init = {
        method  : 'post',
        headers : {
            'Content-Type'  : 'application/json',
            'Authorization' : process.env.API_KEY,
            'API-Version'   : '2023-04',
        },
        body    : JSON.stringify( { 'query' : query } ),
    };
    const response = await getResponseJson( MONDAY_COM_API_URL, init );

    // Get items for this page
    const itemsPage = response.data.boards[ 0 ].items_page;
    return {
        itemIds : itemsPage.items.map( item => item.id ),
        cursor  : itemsPage.cursor,
    };
}

async function getResponseJson( url, init ) {
    let responseJson;

    try {
        const response = await fetch( url, init );

        responseJson = await response.json();
    } catch ( error ) {
        throw (
            error
        );
    }

    return responseJson;
}

async function initializePlaywright( timeoutOption ) {
    browser = await playwright
        .chromium
        .connectOverCDP( 'http://localhost:9222' );
    const defaultContext = browser.contexts()[ 0 ];
    page = defaultContext.pages()[ 0 ];

    const timeout = timeoutOption || DEFAULT_TIMEOUT;

    page.setDefaultTimeout( timeout );
}

function writeCollaborationBoxesFile( json ) {

}

async function main() {
    const boardId = process.argv[ 2 ];
    const itemIds = await getItemIdsForBoard( boardId );

    await initializePlaywright();

    const outputDir = path.join( COLLABORATION_BOX_FILES_DIR, boardId );
    if ( ! fs.existsSync( outputDir ) ) {
        fs.mkdirSync( outputDir );
    }

    await fetchInfoBoxes( itemIds, outputDir );

    browser.close();
}

main();
