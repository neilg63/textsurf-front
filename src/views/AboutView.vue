<template>
  <div class="inner">
    <p>Welcome to the alpha version of <strong>TextSurf</strong>, an innovative way to navigate the textual Web without the extra load or distraction of multimedia and advertising. Other text-only Web browsing tools merely suppress imagery. By contrast TextSurf strips all multimedia assets, client-side scripts and stylesheets from source Web pages before they reach you. This significantly lightens the load. </p>
 <p>TextSurf uses a Rust-based server application to fetch requested resources and retrieve only the main text and link sections. If you see miminal content, you may click on the <em>Main Text</em> tab again to retrieve the content via a headless browser.</p>
<p>However, often what end users may consider the main part of a page is dwarfed by other content, often exposing text that would be normally hidden by stylesheets or javascript. As a result, in some cases you may get too much text and in others too little. We use a the Cheerio DOM-manipulation library to analyse the key HTML elements of pages and assign text or link relevance scores. As the project evolves we hope to introduce HTML pattern matching templates for specific sites and common content management systems.</p>
<h3>Known issues</h3>
<ol>
  <li>Some news sites such as The New York Times, Financial Times, and The Times of London require registration. These often contain only basic text often with Javascript redirects to subscription services.</li>
  <li>Some slow-loading and very heavy pages with excessively nested HTML structures may time out. We're working on more efficient algorithms</li>
  <li>TextSurf does not support iframes. In future, we may add these as links to related resources. Sometimes, these contain useful information, however, more often than not iframes are used for third party services, Youtube or Vimeo videos, advertising and some malicious backend scripts. TextSurf strips all Javascipt from source sites.</li>
  <li>Some sites return incorrect text encoding and cannot be parsed. Modern sites should use utf-8 or utf-16, but many choose to use earlier standards that fool our http response handler. In some cases you may see odd diamond characters with question marks.</li>
</ol>
<p class="important"><em>NB</em>: This is an alpha version only and may not successfully render all Web pages due to some unresolved URL and HTML parsing issues. Nonetheless, it has been tested on some leading news sites. Please bear with us while we improve our Text and HTML analysis software.</p>
  <p>TextSurf fetches the core text content from Web pages and strips any images or other media assets. As Textsurf fetches pages anonymously, it will not work with any sites that require you to log in or maintain a session such as social networking and e-commerce portals. We will thus block access to some popular sites such as Facebook, Twitter, ebay or Amazon </p>
  </div>
</template>


