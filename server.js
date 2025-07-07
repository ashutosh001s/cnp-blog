const express = require('express');
const path = require('path');
const fs = require('fs');
const { renderMainHTML, getHomeContent, getPostsContent, getPostContent, generatePostImage } = require('./render.js');

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
    posts = [];
}

// Store newsletter subscribers
const subscribers = [];

// Routes
app.get('/', (req, res) => {
    try {
        if (req.headers['hx-request']) {
            res.send(getHomeContent(posts));
        } else {
            const title = 'CodeNPixel - Game Dev & Graphics Programming';
            const description = 'Dive into game development and graphics programming with CodeNPixel. Learn Unreal Engine, OpenGL, and more through tutorials and insights.';
            res.send(renderMainHTML(getHomeContent(posts), title, description));
        }
    } catch (error) {
        console.error('Error serving home page:', error);
        res.status(500).send(renderMainHTML(
            '<div class="text-center py-16"><h1 class="text-3xl font-bold text-gray-800">Error loading page</h1></div>',
            'Error - CodeNPixel',
            'An error occurred while loading the page.'
        ));
    }
});

app.get('/posts', (req, res) => {
    try {
        const filter = req.query.filter || 'all';
        const value = req.query.value || '';
        const content = getPostsContent(posts, filter, value);
        if (req.headers['hx-request']) {
            res.send(content);
        } else {
            const title = filter === 'tag' ? `Posts tagged with "${value}" - CodeNPixel` :
                         filter === 'category' ? `${value} Posts - CodeNPixel` :
                         'All Posts - CodeNPixel';
            const description = `Explore ${filter === 'tag' ? `posts tagged with "${value}"` : filter === 'category' ? `${value} posts` : 'all posts'} on game development and graphics programming at CodeNPixel.`;
            res.send(renderMainHTML(content, title, description));
        }
    } catch (error) {
        console.error('Error serving posts page:', error);
        const errorContent = '<div class="text-center py-16"><h1 class="text-3xl font-bold text-gray-800">Error loading posts</h1></div>';
        if (req.headers['hx-request']) {
            res.status(500).send(errorContent);
        } else {
            res.status(500).send(renderMainHTML(errorContent, 'Error - CodeNPixel', 'An error occurred while loading posts.'));
        }
    }
});

app.get('/post/:slug', (req, res) => {
    try {
        const postSlug = req.params.slug;
        const content = getPostContent(posts, postSlug);
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
                return res.status(404).send(renderMainHTML(notFoundContent, 'Post Not Found - CodeNPixel', 'The requested post was not found.'));
            }
        }
        const post = posts.find(p => p.slug === postSlug);
        if (req.headers['hx-request']) {
            res.send(content);
        } else {
            const title = post ? `${post.title} - CodeNPixel` : 'Post - CodeNPixel';
            const description = post ? post.description : 'Read this post on game development and graphics programming at CodeNPixel.';
            res.send(renderMainHTML(content, title, description));
        }
    } catch (error) {
        console.error('Error serving post page:', error);
        const errorContent = '<div class="text-center py-16"><h1 class="text-3xl font-bold text-gray-800">Error loading post</h1></div>';
        if (req.headers['hx-request']) {
            res.status(500).send(errorContent);
        } else {
            res.status(500).send(renderMainHTML(errorContent, 'Error - CodeNPixel', 'An error occurred while loading the post.'));
        }
    }
});

app.get('/home', (req, res) => {
    try {
        res.send(getHomeContent(posts));
    } catch (error) {
        console.error('Error serving home content:', error);
        res.status(500).send('<div class="text-center py-16"><h1 class="text-3xl font-bold text-gray-800">Error loading home content</h1></div>');
    }
});

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
                <a href="/post/${post.slug}"  class="inline-flex items-center text-brand-orange font-semibold hover:text-brand-orange-light transition-colors duration-200 cursor-pointer" 
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

app.get('/api/posts/json', (req, res) => {
    res.json(posts);
});

app.get('/api/posts/:slug', (req, res) => {
    const postSlug = req.params.slug;
    const post = posts.find(p => p.slug === postSlug);
    if (!post) {
        return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
});

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
        res.status(500).send(renderMainHTML(errorContent, 'Error - CodeNPixel', 'An error occurred on the server.'));
    }
});

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
        res.status(404).send(renderMainHTML(notFoundContent, 'Page Not Found - CodeNPixel', 'The requested page was not found.'));
    }
});

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