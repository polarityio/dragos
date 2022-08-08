# Polarity Dragos Integration

The Dragos Platform is a cybersecurity software that identifies ICS network assets, malicious activity, and provides guidance to investigate incidents

The Dragos Polarity Integration searches the Dragos WorldView API for incidents related to malicious IPs, Hostnames, Domains, SHA1, SHA256, and MD5 hashes, as well as by tags in the Dragos platform. 

To learn more about Dragos, please visit https://www.dragos.com/

## Dragos Integration Options

### Dragos API Url

API Url for Dragos allows searching indicators via the Dragos API.

### API Token

API Token provided by Dragos allows access to make searches using the Dragos API. An API token can be generated in the Dragos user dashboard.

### API Key

API Key provided by Dragos allows access to make searches using the Dragos API. An API key can be generated in the Dragos user dashboard.

### Max Concurrent Search Requests

Maximum number of concurrent search requests (defaults to 20). Integration must be restarted after changing this option.

### Minimum Time Between Searches

Minimum amount of time in milliseconds between each entity search (defaults to 100). Integration must be restarted after changing this option.


### Custom Types 
| Types    | Notes                                                                                                                                                                                                                                                                                                                                                                                                                         |   |   |   |   |
|----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---|---|---|---|
| Filename | These are the following file extensions that can be searched: sys, exe, dll, pdf, file, virus, dontopen, zip, doc, php, hta, bat, pem, txt, dat, docx, msg, db, lnk, jpg, dotm, log, py, xls, ps1, vbe, css, site, store, world, email, group, tools, vip, services, rocks, download, online, network, vin, club, wiki, vbs, ini, top, gdn, bid, tech, html, cloud, win, energy, support, date, app, xyz, desi, software, kim |   |   |   |   |
| Hostname | The custom hostname entity type will match string values of 1-40 characters. Note: The search needs to be exact match, so be mindful of spaces characters when searching hostnames.                                                                                                                                                                                                                                           |   |   |   |   |
| Tag      | The custom tag entity type will match string values of 1-40 characters. Note: The search needs to be exact match, so be mindful of space characters when searching tags.                                                                                                                                                                                                                                                      |   |   |   |   |
|          |                                                                                                                                                                                                                                                                                                                                                                                                                               |   |   |   |   |
## Installation Instructions

Installation instructions for integrations are provided on the [PolarityIO GitHub Page](https://polarityio.github.io/).

## Polarity

Polarity is a memory-augmentation platform that improves and accelerates analyst decision making. For more information about the Polarity platform please see:

https://polarity.io/

