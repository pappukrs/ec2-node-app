// Quick script to verify API configuration
// Run in browser console: copy and paste this

console.log('🔍 API Configuration Check:');
console.log('============================');
console.log('Environment Variable:', process.env.NEXT_PUBLIC_API_BASE_URL || 'NOT SET');
console.log('Current Origin:', window.location.origin);
console.log('Current Host:', window.location.host);

// Try to import config (if available)
if (typeof window !== 'undefined') {
  import('/lib/config').then(({ config }) => {
    console.log('Config API URL:', config.api.baseUrl);
    console.log('Config Environment:', config.env);
  }).catch(() => {
    console.log('Could not load config module');
  });
}

console.log('============================');
console.log('💡 If API URL is wrong, check .env.local file');
console.log('💡 Make sure NEXT_PUBLIC_API_BASE_URL is set correctly');
