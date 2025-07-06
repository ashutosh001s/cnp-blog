const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Load posts from posts.json
let posts = [];
try {
    const postsData = fs.readFileSync(path.join(__dirname, 'posts.json'), 'utf8');
    posts = JSON.parse(postsData);
    console.log(`Loaded ${posts.length} posts from posts.json`);
} catch (error) {
    console.error('Error loading posts.json:', error);
    posts = []; // Fallback to empty array
}

// Store newsletter subscribers
const subscribers = [];

// Helper function to read and modify the main HTML template
function getMainHTML(content, title = 'CodeNPixel - Game Dev & Graphics Programming') {
    try {
        const htmlPath = path.join(__dirname, 'index.html');
        
        // Check if index.html exists
        if (!fs.existsSync(htmlPath)) {
            console.error('index.html not found at:', htmlPath);
            return generateFallbackHTML(content, title);
        }
        
        let html = fs.readFileSync(htmlPath, 'utf8');
        
        // Update title if needed
        if (title !== 'CodeNPixel - Game Dev & Graphics Programming') {
            html = html.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);
        }
        
        // Replace ONLY the content inside main-content div, not the div itself
        const contentRegex = /(<div\s+id="main-content"[^>]*>)([\s\S]*?)(<\/div>\s*<!-- Footer -->)/i;
        
        if (contentRegex.test(html)) {
            html = html.replace(contentRegex, `$1\n        ${content}\n    $3`);
        } else {
            // Alternative regex if the comment is not found
            const altRegex = /(<div\s+id="main-content"[^>]*>)([\s\S]*?)(<\/div>\s*<footer)/i;
            if (altRegex.test(html)) {
                html = html.replace(altRegex, `$1\n        ${content}\n    $3`);
            } else {
                console.error('Could not find main-content div in HTML template');
                return generateFallbackHTML(content, title);
            }
        }
        
        return html;
    } catch (error) {
        console.error('Error processing HTML template:', error);
        return generateFallbackHTML(content, title);
    }
}

// Fallback HTML generator in case index.html is missing or corrupted
// Update the fallback HTML generator function
function generateFallbackHTML(content, title) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="Dive into game development and graphics programming with CodeNPixel. Learn Unreal Engine, OpenGL, and more through tutorials and insights.">
    <meta name="keywords" content="game development, graphics programming, Unreal Engine, OpenGL, game dev, programming tutorials">
    <meta name="author" content="CodeNPixel">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="Dive into game development and graphics programming with CodeNPixel. Learn Unreal Engine, OpenGL, and more through tutorials and insights.">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://codenPixel.com">
    <meta property="og:image" content="/assets/og-image.png">
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="Dive into game development and graphics programming with CodeNPixel. Learn Unreal Engine, OpenGL, and more through tutorials and insights.">
    <meta name="twitter:image" content="/assets/twitter-image.png">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="https://codenPixel.com">
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/htmx.org@1.9.10"></script>
    
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'brand-orange': '#ff6b35',
                        'brand-orange-light': '#ff8c42',
                        'brand-orange-lighter': '#ffa726',
                        'brand-orange-dark': '#e5522d',
                    },
                    backgroundImage: {
                        'brand-gradient': 'linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%)',
                        'brand-gradient-light': 'linear-gradient(135deg, #ff8c42 0%, #ffa726 100%)',
                        'hero-pattern': 'url("data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 100 100\\'><defs><pattern id=\\'grid\\' width=\\'10\\' height=\\'10\\' patternUnits=\\'userSpaceOnUse\\'><path d=\\'M 10 0 L 0 0 0 10\\' fill=\\'none\\' stroke=\\'rgba(255,255,255,0.1)\\' stroke-width=\\'0.5\\'/></pattern></defs><rect width=\\'100\\' height=\\'100\\' fill=\\'url(%23grid)\\'/></svg>")',
                        'dots-pattern': 'url("data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 100 100\\'><circle cx=\\'20\\' cy=\\'20\\' r=\\'2\\' fill=\\'%23ffffff20\\'/><circle cx=\\'80\\' cy=\\'40\\' r=\\'1\\' fill=\\'%23ffffff30\\'/><circle cx=\\'40\\' cy=\\'70\\' r=\\'1.5\\' fill=\\'%23ffffff25\\'/><circle cx=\\'60\\' cy=\\'10\\' r=\\'1\\' fill=\\'%23ffffff20\\'/><circle cx=\\'10\\' cy=\\'60\\' r=\\'1\\' fill=\\'%23ffffff30\\'/><circle cx=\\'90\\' cy=\\'80\\' r=\\'2\\' fill=\\'%23ffffff15\\'/></svg>")',
                    },
                    animation: {
                        'float': 'float 20s ease-in-out infinite',
                        'pulse-slow': 'pulse 3s ease-in-out infinite',
                        'bounce-slow': 'bounce 3s ease-in-out infinite',
                    },
                    keyframes: {
                        float: {
                            '0%, 100%': { transform: 'translateY(0px)' },
                            '50%': { transform: 'translateY(-20px)' },
                        }
                    }
                }
            }
        }
    </script>
    
    <style>
        @keyframes float-dots {
            0% { transform: translateX(-10px); }
            100% { transform: translateX(calc(100vw + 10px)); }
        }
        
        .animate-float-dots {
            animation: float-dots 20s infinite linear;
        }
        
        .htmx-indicator {
            display: none;
        }
        
        .htmx-request .htmx-indicator {
            display: block;
        }
        
        .post-image-generated {
            background-size: 100px 100px;
        }
    </style>
</head>
<body class="bg-gradient-to-br from-white to-orange-50 text-gray-800 leading-relaxed">
    <!-- Header -->
    <header class="bg-white/95 backdrop-blur-sm fixed w-full top-0 z-50 border-b-2 border-brand-orange shadow-lg shadow-brand-orange/10">
        <nav class="container mx-auto px-5 flex justify-between items-center py-4">
            <div class="text-2xl font-bold text-brand-orange cursor-pointer hover:text-brand-orange-light transition-colors duration-300" 
                 hx-get="/home" hx-target="#main-content" hx-push-url="/">
                CodeNPixel
            </div>
            <ul class="hidden md:flex space-x-8">
                <li><a class="text-gray-700 font-medium hover:text-brand-orange transition-all duration-300 cursor-pointer relative group" 
                       hx-get="/home" hx-target="#main-content" hx-push-url="/">
                    Home
                    <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-orange group-hover:w-full transition-all duration-300"></span>
                </a></li>
                <li><a class="text-gray-700 font-medium hover:text-brand-orange transition-all duration-300 cursor-pointer relative group" 
                       hx-get="/posts" hx-target="#main-content" hx-push-url="/posts">
                    Posts
                    <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-orange group-hover:w-full transition-all duration-300"></span>
                </a></li>
                <li><a href="#about" class="text-gray-700 font-medium hover:text-brand-orange transition-all duration-300 relative group">
                    About
                    <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-orange group-hover:w-full transition-all duration-300"></span>
                </a></li>
                <li><a href="#contact" class="text-gray-700 font-medium hover:text-brand-orange transition-all duration-300 relative group">
                    Contact
                    <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-orange group-hover:w-full transition-all duration-300"></span>
                </a></li>
            </ul>
            <!-- Mobile menu button -->
            <button class="md:hidden text-brand-orange hover:text-brand-orange-light transition-colors duration-300">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
            </button>
        </nav>
    </header>

    <!-- Main Content Area -->
    <div id="main-content" class="pt-20">
        ${content}
    </div>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-12">
        <div class="container mx-auto px-5">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div class="text-center md:text-left">
                    <h3 class="text-xl font-bold text-brand-orange mb-4">CodeNPixel</h3>
                    <p class="text-gray-300">Sharing knowledge and experiences in game development and graphics programming.</p>
                </div>
                <div class="text-center md:text-left">
                    <h3 class="text-xl font-bold text-brand-orange mb-4">Categories</h3>
                    <div class="space-y-2">
                        <p><a href="#" class="text-gray-300 hover:text-brand-orange transition-colors duration-300">Unreal Engine</a></p>
                        <p><a href="#" class="text-gray-300 hover:text-brand-orange transition-colors duration-300">OpenGL</a></p>
                        <p><a href="#" class="text-gray-300 hover:text-brand-orange transition-colors duration-300">Game Development</a></p>
                        <p><a href="#" class="text-gray-300 hover:text-brand-orange transition-colors duration-300">Personal Projects</a></p>
                    </div>
                </div>
                <div class="text-center md:text-left">
                    <h3 class="text-xl font-bold text-brand-orange mb-4">Connect</h3>
                    <div class="space-y-2">
                        <p><a href="#" class="text-gray-300 hover:text-brand-orange transition-colors duration-300">GitHub</a></p>
                        <p><a href="#" class="text-gray-300 hover:text-brand-orange transition-colors duration-300">Twitter</a></p>
                        <p><a href="#" class="text-gray-300 hover:text-brand-orange transition-colors duration-300">LinkedIn</a></p>
                        <p><a href="#" class="text-gray-300 hover:text-brand-orange transition-colors duration-300">Email</a></p>
                    </div>
                </div>
            </div>
            <div class="border-t border-gray-700 pt-8 text-center">
                <p class="text-gray-400">&copy; 2024 CodeNPixel. All rights reserved.</p>
            </div>
        </div>
    </footer>
    
    <!-- Include Tailwind Typography Plugin -->
    <script src="https://cdn.tailwindcss.com?plugins=typography"></script>

    <script>
        // Handle newsletter subscription
        document.body.addEventListener('htmx:afterRequest', function(event) {
            if (event.detail.xhr.responseURL.includes('/newsletter')) {
                if (event.detail.xhr.status === 200) {
                    const form = event.target;
                    form.innerHTML = '<p class="text-brand-orange font-bold text-lg">Thank you for subscribing!</p>';
                    setTimeout(() => {
                        location.reload();
                    }, 2000);
                }
            }
        });

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });
    </script>
</body>
</html>`;
}

// Helper function to generate home content
function getHomeContent() {
    return `
        <!-- Hero Section -->
        <section class="bg-brand-gradient text-white py-20 relative overflow-hidden">
            <div class="absolute inset-0 bg-hero-pattern animate-float opacity-30"></div>
            <div class="container mx-auto px-5 text-center relative z-10">
                <div class="max-w-4xl mx-auto">
                    <h1 class="text-5xl md:text-6xl font-bold mb-6 text-shadow-lg">CodeNPixel</h1>
                    <p class="text-xl md:text-2xl mb-8 opacity-90">Dive into Game Development & Graphics Programming</p>
                    <button class="bg-white text-brand-orange px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl shadow-lg cursor-pointer"
                            hx-get="/posts" hx-target="#main-content" hx-push-url="/posts">
                        Explore Posts
                    </button>
                </div>
            </div>
        </section>

        <!-- Newsletter Section -->
        <section class="bg-gradient-to-r from-white to-orange-50 py-16 border-t-4 border-brand-orange">
            <div class="container mx-auto px-5 text-center">
                <h2 class="text-4xl font-bold text-brand-orange mb-4">Stay Updated</h2>
                <p class="text-gray-600 mb-8 text-lg max-w-2xl mx-auto">
                    Get the latest insights on Unreal Engine, OpenGL, and game development straight to your inbox
                </p>
                <form class="flex flex-col sm:flex-row max-w-md mx-auto gap-3" hx-post="/newsletter" hx-swap="outerHTML">
                    <input type="email" name="email" placeholder="Enter your email address" required
                           class="flex-1 px-6 py-4 border-2 border-brand-orange rounded-full text-lg outline-none focus:ring-4 focus:ring-brand-orange/30 transition-all duration-300">
                    <button type="submit" 
                            class="bg-brand-orange text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-brand-orange-dark transition-all duration-300 transform hover:-translate-y-1">
                        Subscribe
                    </button>
                </form>
            </div>
        </section>

        <!-- Posts Section -->
        <section class="py-20 bg-white" id="posts">
            <div class="container mx-auto px-5">
                <h2 class="text-4xl font-bold text-center text-brand-orange mb-12">Latest Posts</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
                     hx-get="/api/posts" hx-trigger="load" hx-swap="innerHTML">
                    <!-- Posts will be loaded here -->
                    <div class="htmx-indicator col-span-full text-center py-8">
                        <div class="inline-block w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p class="text-brand-orange font-semibold text-lg">Loading posts...</p>
                    </div>
                </div>
            </div>
        </section>
    `;
}

// Helper function to generate post image with orange background and relevant icon
function generatePostImage(post) {
    const icons = {
        'game-loop': '🎮',
        'game-engine': '⚙️',
        'architecture': '🏗️',
        'performance': '⚡',
        'real-time': '⏱️',
        'opengl': '🖥️',
        'graphics-programming': '🎨',
        'shaders': '✨',
        'rendering': '🎭',
        'gpu': '💻',
        'procedural-generation': '🌍',
        'algorithms': '🧮',
        'world-building': '🏔️',
        'noise-functions': '🌊',
        'game-design': '🎯',
        'unreal-engine': '🚀',
        'nanite': '💎',
        'graphics': '🎪',
        'game-development': '🎲',
        '3d-rendering': '🎬'
    };

    const primaryTag = post.tags[0]?.replace(/"/g, '').toLowerCase();
    const icon = icons[primaryTag] || '🔥';
    
    return `
        <div class="bg-brand-gradient h-48 flex items-center justify-center flex-col text-white text-center rounded-t-xl relative overflow-hidden">
            <div class="absolute inset-0 bg-dots-pattern bg-repeat animate-float-dots opacity-30"></div>
            <div class="text-5xl mb-3 z-10">${icon}</div>
            <div class="text-sm font-semibold text-shadow z-10 max-w-full px-4 leading-tight">
                ${post.title.length > 50 ? post.title.substring(0, 50) + '...' : post.title}
            </div>
        </div>
    `;
}

// Helper function to generate posts page content
function getPostsContent(filterType = 'all', filterValue = '') {
    let filteredPosts = posts;
    
    // Filter by tag or category
    if (filterType === 'tag' && filterValue) {
        filteredPosts = posts.filter(post => 
            post.tags.some(tag => tag.replace(/"/g, '').toLowerCase() === filterValue.toLowerCase())
        );
    } else if (filterType === 'category' && filterValue) {
        filteredPosts = posts.filter(post => 
            post.category && post.category.toLowerCase() === filterValue.toLowerCase()
        );
    }

    const postsHTML = filteredPosts.map(post => `
        <article class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-2 transform">
            ${generatePostImage(post)}
            <div class="p-6">
                <h3 class="text-xl font-bold text-gray-800 mb-2 leading-tight">${post.title}</h3>
                <div class="text-gray-500 text-sm mb-4 flex items-center gap-2">
                    <span>${new Date(post.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>${post.author}</span>
                </div>
                <p class="text-gray-600 leading-relaxed mb-4">${post.description}</p>
                <div class="flex flex-wrap gap-2 mb-4">
                    ${post.tags.map(tag => `
                        <span class="bg-brand-gradient text-white px-3 py-1 rounded-full text-xs font-medium cursor-pointer hover:scale-105 transition-transform duration-200" 
                              hx-get="/posts?filter=tag&value=${tag.replace(/"/g, '')}" 
                              hx-target="#main-content" 
                              hx-push-url="/posts?filter=tag&value=${tag.replace(/"/g, '')}">
                            #${tag.replace(/"/g, '')}
                        </span>
                    `).join('')}
                </div>
                <a class="inline-flex items-center text-brand-orange font-semibold hover:text-brand-orange-light transition-colors duration-200 cursor-pointer" 
                   hx-get="/post/${post.slug}" hx-target="#main-content" hx-push-url="/post/${post.slug}">
                   Read More 
                   <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                   </svg>
                </a>
            </div>
        </article>
    `).join('');

    // Extract unique tags and categories
    const allTags = [...new Set(posts.flatMap(post => post.tags.map(tag => tag.replace(/"/g, ''))))];
    
    const tagButtons = allTags.map(tag => `
        <button class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
            filterType === 'tag' && filterValue === tag 
                ? 'bg-brand-gradient text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }" 
                hx-get="/posts?filter=tag&value=${tag}" 
                hx-target="#main-content" 
                hx-push-url="/posts?filter=tag&value=${tag}">
            #${tag}
        </button>
    `).join('');

    return `
        <div class="min-h-screen bg-gradient-to-br from-white to-orange-50 py-8">
            <div class="container mx-auto px-5">
                <div class="text-center mb-12">
                    <h1 class="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                        ${filterType === 'tag' ? `Posts tagged with "${filterValue}"` : 
                          filterType === 'category' ? `${filterValue} Posts` : 'All Posts'}
                    </h1>
                    <p class="text-gray-600 text-lg max-w-2xl mx-auto">
                        Explore our collection of game development and graphics programming articles
                    </p>
                </div>
                
                <div class="mb-8">
                    <div class="flex flex-wrap justify-center gap-3 mb-6">
                        <button class="px-6 py-3 rounded-full font-semibold transition-all duration-200 cursor-pointer ${
                            filterType === 'all' 
                                ? 'bg-brand-gradient text-white shadow-lg' 
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                        }" 
                                hx-get="/posts" 
                                hx-target="#main-content" 
                                hx-push-url="/posts">
                            All Posts
                        </button>
                    </div>
                    <div class="text-center mb-4">
                        <span class="text-gray-600 font-medium">Filter by tags:</span>
                    </div>
                    <div class="flex flex-wrap justify-center gap-2">
                        ${tagButtons}
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    ${postsHTML}
                </div>
                
                ${filteredPosts.length === 0 ? `
                    <div class="text-center py-16">
                        <div class="text-6xl mb-4">📝</div>
                        <h3 class="text-xl font-semibold text-gray-700 mb-2">No posts found</h3>
                        <p class="text-gray-500 mb-6">Try adjusting your filter or browse all posts</p>
                        <button class="bg-brand-gradient text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200" 
                                hx-get="/posts" hx-target="#main-content" hx-push-url="/posts">
                            View All Posts
                        </button>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Helper function to generate individual post content
function getPostContent(postSlug) {
    const post = posts.find(p => p.slug === postSlug);
    
    if (!post) {
        return null;
    }

    // Try to read the HTML file if it exists
    let postContent = post.description; // Fallback to description
    try {
        if (post.html_path && fs.existsSync(post.html_path)) {
            postContent = fs.readFileSync(post.html_path, 'utf8');
        } else if (post.markdown_path && fs.existsSync(post.markdown_path)) {
            // If you have a markdown parser, you can use it here
            postContent = fs.readFileSync(post.markdown_path, 'utf8');
        }
    } catch (error) {
        console.error(`Error reading post content for ${postSlug}:`, error);
    }

    return `
        <div class="min-h-screen bg-gradient-to-br from-white to-orange-50 py-8">
            <div class="container mx-auto px-5">
                <div class="max-w-6xl mx-auto">
                    <button class="inline-flex items-center text-brand-orange font-semibold hover:text-brand-orange-light transition-colors duration-200 mb-8 cursor-pointer" 
                            hx-get="/posts" hx-target="#main-content" hx-push-url="/posts">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                        Back to Posts
                    </button>
                    
                    <div class="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                        <div class="h-64 bg-brand-gradient relative overflow-hidden">
                            <div class="absolute inset-0 bg-dots-pattern bg-repeat animate-float-dots opacity-30"></div>
                            <div class="absolute inset-0 flex items-center justify-center">
                                <div class="text-center text-white z-10">
                                    <div class="text-6xl mb-4">
                                        ${(() => {
                                            const icons = {
                                                'game-loop': '🎮', 'game-engine': '⚙️', 'architecture': '🏗️',
                                                'performance': '⚡', 'real-time': '⏱️', 'opengl': '🖥️',
                                                'graphics-programming': '🎨', 'shaders': '✨', 'rendering': '🎭',
                                                'gpu': '💻', 'procedural-generation': '🌍', 'algorithms': '🧮',
                                                'world-building': '🏔️', 'noise-functions': '🌊', 'game-design': '🎯',
                                                'unreal-engine': '🚀', 'nanite': '💎', 'graphics': '🎪',
                                                'game-development': '🎲', '3d-rendering': '🎬'
                                            };
                                            const primaryTag = post.tags[0]?.replace(/"/g, '').toLowerCase();
                                            return icons[primaryTag] || '🔥';
                                        })()}
                                    </div>
                                    <h1 class="text-2xl md:text-3xl font-bold text-shadow px-6">${post.title}</h1>
                                </div>
                            </div>
                        </div>
                        
                        <div class="p-8 md:p-12">
                            <div class="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-gray-200">
                                <div class="flex items-center text-gray-600">
                                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                    </svg>
                                    <span class="font-medium">${post.author}</span>
                                </div>
                                <div class="flex items-center text-gray-600">
                                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                    <span>${new Date(post.date).toLocaleDateString()}</span>
                                </div>
                            </div>
                            
                            <div class="flex flex-wrap gap-2 mb-8">
                                ${post.tags.map(tag => `
                                    <span class="bg-brand-gradient text-white px-4 py-2 rounded-full text-sm font-medium cursor-pointer hover:scale-105 transition-transform duration-200" 
                                          hx-get="/posts?filter=tag&value=${tag.replace(/"/g, '')}" 
                                          hx-target="#main-content" 
                                          hx-push-url="/posts?filter=tag&value=${tag.replace(/"/g, '')}">
                                        #${tag.replace(/"/g, '')}
                                    </span>
                                `).join('')}
                            </div>
                            
                            <div class="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                                ${postContent}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Routes

// Serve the main HTML file for direct access
app.get('/', (req, res) => {
    try {
        if (req.headers['hx-request']) {
            res.send(getHomeContent());
        } else {
            // For direct access, check if index.html exists
            const indexPath = path.join(__dirname, 'index.html');
            if (fs.existsSync(indexPath)) {
                res.sendFile(indexPath);
            } else {
                // Generate complete HTML with home content
                res.send(getMainHTML(getHomeContent()));
            }
        }
    } catch (error) {
        console.error('Error serving home page:', error);
        res.status(500).send(getMainHTML('<div class="text-center py-16"><h1 class="text-3xl font-bold text-gray-800">Error loading page</h1></div>', 'Error - CodeNPixel'));
    }
});

// Posts page - handles both full page requests and HTMX requests
app.get('/posts', (req, res) => {
    try {
        const filter = req.query.filter || 'all';
        const value = req.query.value || '';
        const content = getPostsContent(filter, value);
        
        if (req.headers['hx-request']) {
            res.send(content);
        } else {
            const title = filter === 'tag' ? `Posts tagged with "${value}" - CodeNPixel` : 
                         filter === 'category' ? `${value} Posts - CodeNPixel` : 
                         'All Posts - CodeNPixel';
            res.send(getMainHTML(content, title));
        }
    } catch (error) {
        console.error('Error serving posts page:', error);
        const errorContent = '<div class="text-center py-16"><h1 class="text-3xl font-bold text-gray-800">Error loading posts</h1></div>';
        if (req.headers['hx-request']) {
            res.status(500).send(errorContent);
        } else {
            res.status(500).send(getMainHTML(errorContent, 'Error - CodeNPixel'));
        }
    }
});

// Individual post page - handles both full page requests and HTMX requests
app.get('/post/:slug', (req, res) => {
    try {
        const postSlug = req.params.slug;
        const content = getPostContent(postSlug);
        
        if (!content) {
            const notFoundContent = `
                <div class="min-h-screen bg-gradient-to-br from-white to-orange-50 py-8">
                    <div class="container mx-auto px-5">
                        <div class="text-center py-16">
                            <div class="text-6xl mb-4">📝</div>
                            <h1 class="text-3xl font-bold text-gray-800 mb-4">Post Not Found</h1>
                            <p class="text-gray-600 mb-8">The post you're looking for doesn't exist.</p>
                            <button class="bg-brand-gradient text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200" 
                                    hx-get="/posts" hx-target="#main-content" hx-push-url="/posts">
                                Browse All Posts
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            if (req.headers['hx-request']) {
                return res.status(404).send(notFoundContent);
            } else {
                return res.status(404).send(getMainHTML(notFoundContent, 'Post Not Found - CodeNPixel'));
            }
        }

        const post = posts.find(p => p.slug === postSlug);
        
        if (req.headers['hx-request']) {
            res.send(content);
        } else {
            const title = post ? `${post.title} - CodeNPixel` : 'Post - CodeNPixel';
            res.send(getMainHTML(content, title));
        }
    } catch (error) {
        console.error('Error serving post page:', error);
        const errorContent = '<div class="text-center py-16"><h1 class="text-3xl font-bold text-gray-800">Error loading post</h1></div>';
        if (req.headers['hx-request']) {
            res.status(500).send(errorContent);
        } else {
            res.status(500).send(getMainHTML(errorContent, 'Error - CodeNPixel'));
        }
    }
});


// HTMX specific routes
app.get('/home', (req, res) => {
    try {
        res.send(getHomeContent());
    } catch (error) {
        console.error('Error serving home content:', error);
        res.status(500).send('<div class="text-center py-16"><h1 class="text-3xl font-bold text-gray-800">Error loading home content</h1></div>');
    }
});

// API endpoint for posts (used by HTMX)
app.get('/api/posts', (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit) : 6;
    const recentPosts = posts.slice(0, limit);
    
    const postsHTML = recentPosts.map(post => `
        <article class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-2 transform">
            ${generatePostImage(post)}
            <div class="p-6">
                <h3 class="text-xl font-bold text-gray-800 mb-2 leading-tight">${post.title}</h3>
                <div class="text-gray-500 text-sm mb-4 flex items-center gap-2">
                    <span>${new Date(post.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>${post.author}</span>
                </div>
                <p class="text-gray-600 leading-relaxed mb-4">${post.description}</p>
                <div class="flex flex-wrap gap-2 mb-4">
                    ${post.tags.map(tag => `
                        <span class="bg-brand-gradient text-white px-3 py-1 rounded-full text-xs font-medium cursor-pointer hover:scale-105 transition-transform duration-200" 
                              onclick="window.location.href='/posts?filter=tag&value=${tag.replace(/"/g, '')}'">
                            #${tag.replace(/"/g, '')}
                        </span>
                    `).join('')}
                </div>
                <a class="inline-flex items-center text-brand-orange font-semibold hover:text-brand-orange-light transition-colors duration-200 cursor-pointer" 
                   hx-get="/post/${post.slug}" hx-target="#main-content" hx-push-url="/post/${post.slug}">
                   Read More 
                   <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                   </svg>
                </a>
            </div>
        </article>
    `).join('');
    
    res.send(postsHTML);
});

// Newsletter subscription
app.post('/newsletter', (req, res) => {
    const email = req.body.email;
    
    if (!email || !email.includes('@')) {
        return res.status(400).send('<p class="text-red-500 font-semibold">Please enter a valid email address</p>');
    }
    
    if (subscribers.includes(email)) {
        return res.send('<p class="text-orange-500 font-semibold">You are already subscribed!</p>');
    }
    
    subscribers.push(email);
    console.log(`New subscriber: ${email}`);
    
    res.send('<p class="text-brand-orange font-bold text-lg">Thank you for subscribing!</p>');
});

// API endpoint to get all posts (JSON)
app.get('/api/posts/json', (req, res) => {
    res.json(posts);
});

// API endpoint to get a single post (JSON)
app.get('/api/posts/:slug', (req, res) => {
    const postSlug = req.params.slug;
    const post = posts.find(p => p.slug === postSlug);
    
    if (!post) {
        return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(post);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    const errorContent = `
        <div class="min-h-screen bg-gradient-to-br from-white to-orange-50 py-8">
            <div class="container mx-auto px-5">
                <div class="text-center py-16">
                    <div class="text-6xl mb-4">⚠️</div>
                    <h1 class="text-3xl font-bold text-gray-800 mb-4">Something went wrong!</h1>
                    <p class="text-gray-600 mb-8">Please try again later.</p>
                    <button class="bg-brand-gradient text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200" 
                            onclick="window.location.href='/'">
                        Go Home
                    </button>
                </div>
            </div>
        </div>
    `;
    
    if (req.headers['hx-request']) {
        res.status(500).send(errorContent);
    } else {
        res.status(500).send(getMainHTML(errorContent, 'Error - CodeNPixel'));
    }
});

// 404 handler
app.use((req, res) => {
    const notFoundContent = `
        <div class="min-h-screen bg-gradient-to-br from-white to-orange-50 py-8">
            <div class="container mx-auto px-5">
                <div class="text-center py-16">
                    <div class="text-6xl mb-4">🔍</div>
                    <h1 class="text-3xl font-bold text-gray-800 mb-4">Page Not Found</h1>
                    <p class="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
                    <button class="bg-brand-gradient text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200" 
                            onclick="window.location.href='/'">
                        Go Home
                    </button>
                </div>
            </div>
        </div>
    `;
    
    if (req.headers['hx-request']) {
        res.status(404).send(notFoundContent);
    } else {
        res.status(404).send(getMainHTML(notFoundContent, 'Page Not Found - CodeNPixel'));
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Available routes:`);
    console.log(`  GET  /                    - Main page`);
    console.log(`  GET  /posts              - Posts page`);
    console.log(`  GET  /post/:slug         - Individual post`);
    console.log(`  GET  /api/posts          - Posts HTML (for HTMX)`);
    console.log(`  GET  /api/posts/json     - Posts JSON`);
    console.log(`  GET  /api/posts/:slug    - Single post JSON`);
    console.log(`  POST /newsletter         - Newsletter subscription`);
});

module.exports = app;