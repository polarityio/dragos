# Polarity Dragos Integration

Dragos is a threat analysis platform that seamlessly integrates best of breed open source projects, third party commercial solutions and their own technology in a purpose built application that fully automates the steps an experienced security analyst or researcher would follow to analyze a suspected threat.

The Dragos Polarity Integration searches the Dragos API for Attack Chain data for Domains, URLs, IPs, SHA256 Hashes and MD5 Hashes for phishing related activity and a Score Assessment.

<img width="350" alt="Integration Example" src="./assets/twinwave.png">

To learn more about Dragos, please visit https://www.twinwave.io/

## Dragos Integration Options

### Dragos API URL

API URL for Dragos allows searching indicators via the Dragos API.

### API Token 
API Token provided by Dragos allows access to make searches using the Dragos API. An API token can be generated in the Dragos user dashboard.

### API Key

API Key provided by Dragos allows access to make searches using the Dragos API. An API key can be generated in the Dragos user dashboard.

### Max Concurrent Search Requests

Maximum number of concurrent search requests (defaults to 20). Integration must be restarted after changing this option.

### Minimum Time Between Searches

Minimum amount of time in milliseconds between each entity search (defaults to 100). Integration must be restarted after changing this option.

## Installation Instructions

Installation instructions for integrations are provided on the [PolarityIO GitHub Page](https://polarityio.github.io/).

## Polarity

Polarity is a memory-augmentation platform that improves and accelerates analyst decision making. For more information about the Polarity platform please see:

https://polarity.io/
