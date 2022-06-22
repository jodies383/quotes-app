import './style.css'
import Alpine from 'alpinejs'
import {LoveCounter} from './love-counter';
import Quotes from './quotes';
import './quotes.css'

window.Alpine = Alpine

Alpine.data('quoteApp', Quotes)
Alpine.data('loveCounter', LoveCounter);
Alpine.start()

document.querySelector('#app').innerHTML = `
"I 💚 Alpine JS!"
`