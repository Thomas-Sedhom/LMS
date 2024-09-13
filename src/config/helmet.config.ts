import helmet from 'helmet';

const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      //'self' means that content can only be loaded from the same origin (domain) as your website.
      defaultSrc: ["'self'"], //sets the default policy for all types of content if no other directive specifies a source.
      scriptSrc: ["'self'"], //specifies which sources are allowed for JavaScript files
      styleSrc: ["'self'", "https://fonts.googleapis.com"], //specifies which sources are allowed for CSS stylesheets
      imgSrc: ["'self'", "https://firebasestorage.googleapis.com"], // Allow images from Firebase
      mediaSrc: ["'self'", "https://vdocipher.com"], // Allow videos from VdoCipher
      connectSrc: ["'self'"], // Allow connections to your API or other services
      frameAncestors: ["'none'"], // Prevent framing of your site (useful for clickjacking protection)
      objectSrc: ["'none'"], // Disallow Flash or other object elements
      upgradeInsecureRequests: [], // Upgrade HTTP requests to HTTPS
    },
  },
});

export default helmetConfig;