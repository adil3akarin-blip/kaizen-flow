#!/usr/bin/env node
import webpush from 'web-push'

const keys = webpush.generateVAPIDKeys()

console.log('Add to .env:')
console.log(`VITE_VAPID_PUBLIC_KEY=${keys.publicKey}`)
console.log('')
console.log('Add to Cloudflare Worker secrets:')
console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`)
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`)
