module.exports = {
  /**
   * Name of the integration which is displayed in the Polarity integrations user interface
   *
   * @type String
   * @required
   */
  name: 'Dragos',
  /**
   * The acronym that appears in the notification window when information from this integration
   * is displayed.  Note that the acronym is included as part of each "tag" in the summary information
   * for the integration.  As a result, it is best to keep it to 4 or less characters.  The casing used
   * here will be carried forward into the notification window.
   *
   * @type String
   * @required
   */
  acronym: 'DRG',
  /**
   * Description for this integration which is displayed in the Polarity integrations user interface
   *
   * @type String
   * @optional
   */
  description:
    'The Dragos Polarity Integration searches the Dragos WorldView API for information on custom Filenames, Hostnames, Domains, URLs, IPs, SHA1, SHA256 and MD5 hashes.',
  entityTypes: ['domain', 'url', 'sha1', 'sha256', 'md5', 'ip'],
  customTypes: [
    {
      key: 'filename',
      regex: /^.*\.(jpg|JPG|gif|GIF|doc|DOC|pdf|PDF|docx|DOCX|db|DBsys|SYS|exe|EXE|dll|DLL|pdf|PDF|file|FILE|virus|VIRUS|dontopen|DONTOPEN|zip|ZIP|doc|DOC|php|PHP|hta|HTA|bat|BAT|pem|PEM|txt|TXT|dat|DAT|docx|DOCX|msg|MSG|db|DB|lnk|LNK|jpg|JPG|dotm|DOTM|log|LOG|py|PY|xls|XLS|ps1|PS1|vbe|VBE|css|CSS|site|SITE|store|STORE|world|WORLD|email|EMAIL|group|GROUP|tools|TOOLS|vip|VIP|services|SERVICES|rocks|ROCKS|download|DOWNLOAD|online|ONLINE|network|NETWORK|vin|VIN|club|CLUB|wiki|WIKI|vbs|VBS|ini|INI|top|TOP|gdn|GDN|bid|BID|tech|TECH|html|HTML|cloud|CLOUD|win|WIN|energy|ENERGY|support|SUPPORT|date|DATE|app|APP|xyz|XYZ|desi|DESI|software|SOFTWARE|kim|KIM)$/
    },
    {
      key: 'hostname',
      regex: /(.+?)(?=\.)/
    },
    {
      key: 'tag',
      regex: /^\w{1,40}$/
    }
  ],
  onDemandOnly: true,
  defaultColor: 'light-purple',
  /**
   * An array of style files (css or less) that will be included for your integration. Any styles specified in
   * the below files can be used in your custom template.
   *
   * @type Array
   * @optional
   */
  styles: ['./styles/styles.less'],
  /**
   * Provide custom component logic and template for rendering the integration details block.  If you do not
   * provide a custom template and/or component then the integration will display data as a table of key value
   * pairs.
   *
   * @type Object
   * @optional
   */
  block: {
    component: {
      file: './components/block.js'
    },
    template: {
      file: './templates/block.hbs'
    }
  },
  request: {
    // Provide the path to your certFile. Leave an empty string to ignore this option.
    // Relative paths are relative to the UrlScan integration's root directory
    cert: '',
    // Provide the path to your private key. Leave an empty string to ignore this option.
    // Relative paths are relative to the UrlScan integration's root directory
    key: '',
    // Provide the key passphrase if required.  Leave an empty string to ignore this option.
    // Relative paths are relative to the UrlScan integration's root directory
    passphrase: '',
    // Provide the Cercificate Authority. Leave an empty string to ignore this option.
    // Relative paths are relative to the UrlScan integration's root directory
    ca: '',
    // An HTTP proxy to be used. Supports proxy Auth with Basic Auth, identical to support for
    // the url parameter (by embedding the auth info in the uri)
    proxy: '',

    rejectUnauthorized: true
  },
  logging: {
    level: 'trace' //trace, debug, info, warn, error, fatal
  },
  /**
   * Options that are displayed to the user/admin in the Polarity integration user-interface.  Should be structured
   * as an array of option objects.
   *
   * @type Array
   * @optional
   */
  options: [
    {
      key: 'url',
      name: 'API Url',
      description: 'URL for Dragos WorldView API.  The default value is \'https://portal.dragos.com\'',
      default: 'https://portal.dragos.com',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'apiToken',
      name: 'API Token',
      description: 'Token for Dragos WoldView API',
      default: '',
      type: 'password',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'apiKey',
      name: 'API Key',
      description: 'API key for Dragos WoldView API',
      default: '',
      type: 'password',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'maxConcurrent',
      name: 'Max Concurrent Requests',
      description:
        'Maximum number of concurrent requests.  Integration must be restarted after changing this option. Defaults to 20.',
      default: 20,
      type: 'number',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'minTime',
      name: 'Minimum Time Between Lookups',
      description:
        'Minimum amount of time in milliseconds between lookups. Integration must be restarted after changing this option. Defaults to 100.',
      default: 100,
      type: 'number',
      userCanEdit: false,
      adminOnly: true
    }
  ]
};
