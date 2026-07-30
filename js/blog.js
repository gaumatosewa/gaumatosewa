/**
 * blog.js - Blog Section Renderer
 * Loads posts from data/blog.json, renders card grid,
 * handles modal view with comments, likes, and guest commenting.
 */

const Blog = {
    posts: [],

    async load() {
        try {
            const res = await fetch('/data/blog.json?t=' + Date.now());
            if (res.ok) {
                const data = await res.json();
                this.posts = data.posts || [];
            }
        } catch (e) {
            console.warn('Blog: Could not load blog.json');
        }
        // Restore user likes/comments from localStorage
        this.restoreUserData();
    },

    restoreUserData() {
        try {
            const stored = JSON.parse(localStorage.getItem('blog_user_data') || '{}');
            this.userLikes = stored.likes || {};       // { slug: true }
            this.userComments = stored.comments || {};  // { slug: [{name, text, date, likes}] }
        } catch (e) {
            this.userLikes = {};
            this.userComments = {};
        }
    },

    saveUserData() {
        try {
            localStorage.setItem('blog_user_data', JSON.stringify({
                likes: this.userLikes,
                comments: this.userComments
            }));
        } catch (e) {}
    },

    getPost(slug) {
        return this.posts.find(p => p.slug === slug);
    },

    getLikesCount(post) {
        const base = post.likes || 0;
        const userComments = (this.userComments[post.slug] || []).reduce((sum, c) => sum + (c.likes || 0), 0);
        return base + userComments;
    },

    getComments(post) {
        const original = post.comments || [];
        const userAdded = this.userComments[post.slug] || [];
        return [...original, ...userAdded];
    },

    getViews(post) {
        return post.views || 0;
    },

    getCategoryColor(category) {
        const map = {
            'Gau Products': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
            'Bio Fertilizers': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
            'Herbs': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
        };
        return map[category] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
    },

    getCardGradient(color) {
        const map = {
            'amber': 'from-amber-400 to-orange-500',
            'green': 'from-green-400 to-teal-500',
            'emerald': 'from-emerald-400 to-green-500',
        };
        return map[color] || 'from-emerald-400 to-green-500';
    },

    formatDate(dateStr) {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    },

    getInitials(name) {
        return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    },

    getAvatarColor(name) {
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
        const colors = ['bg-amber-100 text-amber-700', 'bg-emerald-100 text-emerald-700', 'bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-rose-100 text-rose-700', 'bg-teal-100 text-teal-700'];
        return colors[Math.abs(hash) % colors.length];
    },

    renderBlogSection() {
        const container = document.getElementById('blogGrid');
        if (!container || this.posts.length === 0) return;

        container.innerHTML = this.posts.map(post => {
            const catColor = this.getCategoryColor(post.category);
            const gradient = this.getCardGradient(post.color);
            const totalLikes = this.getLikesCount(post);
            const totalComments = this.getComments(post).length;
            const isLiked = this.userLikes[post.slug];

            return `
            <article class="group cursor-pointer bg-white rounded-2xl border border-emerald-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1" onclick="Blog.openModal('${post.slug}')">
                <div class="relative h-48 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden">
                    <div class="text-center text-white/90 px-6">
                        <span class="text-4xl mb-2 block">${this.getCategoryIcon(post.category)}</span>
                        <span class="text-xs font-medium uppercase tracking-wider opacity-75">${post.category}</span>
                    </div>
                    <div class="absolute top-3 left-3">
                        <span class="px-2.5 py-1 rounded-full text-xs font-medium ${catColor.bg} ${catColor.text}">${post.category}</span>
                    </div>
                    <div class="absolute top-3 right-3">
                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-emerald-700">${post.readTime}</span>
                    </div>
                </div>
                <div class="p-5">
                    <h3 class="font-bold text-emerald-900 text-base leading-snug mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2">${post.title}</h3>
                    <p class="text-emerald-700/60 text-sm leading-relaxed mb-4 line-clamp-2">${post.excerpt}</p>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <div class="w-7 h-7 rounded-full ${this.getAvatarColor(post.author.name)} flex items-center justify-center text-[10px] font-bold">${this.getInitials(post.author.name)}</div>
                            <div>
                                <p class="text-xs font-medium text-emerald-900">${post.author.name}</p>
                                <p class="text-[10px] text-emerald-600/50">${this.formatDate(post.date)}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-3 text-emerald-600/50 text-xs">
                            <span class="flex items-center gap-1" title="${totalLikes} likes">
                                <svg class="w-3.5 h-3.5" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                                ${totalLikes}
                            </span>
                            <span class="flex items-center gap-1" title="${totalComments} comments">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                ${totalComments}
                            </span>
                            <span class="flex items-center gap-1" title="${this.getViews(post)} views">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                ${this.getViews(post)}
                            </span>
                        </div>
                    </div>
                </div>
            </article>`;
        }).join('');
    },

    getCategoryIcon(category) {
        const icons = {
            'Gau Products': '&#129692;',
            'Bio Fertilizers': '&#129514;',
            'Herbs': '&#127793;',
        };
        return icons[category] || '&#128196;';
    },

    openModal(slug) {
        const post = this.getPost(slug);
        if (!post) return;

        // Increment view count in localStorage
        const viewKey = 'blog_views_' + slug;
        const viewed = sessionStorage.getItem(viewKey);
        if (!viewed) {
            sessionStorage.setItem(viewKey, '1');
        }

        const catColor = this.getCategoryColor(post.category);
        const gradient = this.getCardGradient(post.color);
        const totalLikes = this.getLikesCount(post);
        const isLiked = !!this.userLikes[post.slug];
        const comments = this.getComments(post);

        const modal = document.getElementById('blogModal');
        const content = document.getElementById('blogModalContent');

        content.innerHTML = `
        <div class="max-w-3xl mx-auto">
            <!-- Header image -->
            <div class="relative h-52 sm:h-64 bg-gradient-to-br ${gradient} rounded-t-2xl flex items-center justify-center -mx-6 -mt-6 mb-6">
                <span class="text-6xl text-white/80">${this.getCategoryIcon(post.category)}</span>
                <button onclick="Blog.closeModal()" class="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"></path></svg>
                </button>
            </div>

            <!-- Meta -->
            <div class="flex flex-wrap items-center gap-3 mb-4">
                <span class="px-3 py-1 rounded-full text-xs font-medium ${catColor.bg} ${catColor.text}">${post.category}</span>
                <span class="text-xs text-emerald-600/50">${this.formatDate(post.date)}</span>
                <span class="text-xs text-emerald-600/50">${post.readTime}</span>
                <span class="text-xs text-emerald-600/50 flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    ${this.getViews(post)} views
                </span>
            </div>

            <!-- Title -->
            <h2 class="text-2xl sm:text-3xl font-bold text-emerald-900 mb-3 leading-tight">${post.title}</h2>

            <!-- Author + Like -->
            <div class="flex items-center justify-between mb-6 pb-6 border-b border-emerald-100">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full ${this.getAvatarColor(post.author.name)} flex items-center justify-center text-sm font-bold">${this.getInitials(post.author.name)}</div>
                    <div>
                        <p class="text-sm font-semibold text-emerald-900">${post.author.name}</p>
                        <p class="text-xs text-emerald-600/50">${post.author.role}</p>
                    </div>
                </div>
                <button onclick="Blog.toggleLike('${post.slug}')" class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${isLiked ? 'bg-red-50 text-red-500 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100'}" id="likeBtn_${post.slug}">
                    <svg class="w-4 h-4" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    <span id="likeCount_${post.slug}">${totalLikes}</span>
                </button>
            </div>

            <!-- Content -->
            <div class="prose prose-emerald max-w-none mb-8 text-emerald-900/80 leading-relaxed text-sm [&>p]:mb-4 [&>h3]:text-lg [&>h3]:font-bold [&>h3]:text-emerald-900 [&>h3]:mt-6 [&>h3]:mb-3 [&>em]:text-emerald-700">
                ${post.content}
            </div>

            <!-- Tags -->
            <div class="flex flex-wrap gap-2 mb-8 pb-6 border-b border-emerald-100">
                ${post.tags.map(t => `<span class="px-3 py-1 rounded-full text-xs bg-emerald-50 text-emerald-600 border border-emerald-100">#${t}</span>`).join('')}
            </div>

            <!-- Comments Section -->
            <div>
                <h3 class="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
                    <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    Comments (${comments.length})
                </h3>

                <div id="commentsList_${post.slug}" class="space-y-4 mb-6 max-h-80 overflow-y-auto pr-1">
                    ${this.renderComments(comments, post.slug)}
                </div>

                <!-- Comment Form -->
                <div class="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
                    <h4 class="text-sm font-semibold text-emerald-900 mb-3">Leave a comment</h4>
                    <div class="flex gap-3 mb-3">
                        <input type="text" id="commentName_${post.slug}" placeholder="Your name" class="flex-1 px-3 py-2 border border-emerald-200 rounded-lg text-sm bg-white text-emerald-900 outline-none focus:border-emerald-500">
                    </div>
                    <textarea id="commentText_${post.slug}" rows="3" placeholder="Share your thoughts..." class="w-full px-3 py-2 border border-emerald-200 rounded-lg text-sm bg-white text-emerald-900 outline-none focus:border-emerald-500 resize-none mb-3"></textarea>
                    <div class="flex justify-end">
                        <button onclick="Blog.addComment('${post.slug}')" class="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors">Post Comment</button>
                    </div>
                    <p id="commentError_${post.slug}" class="text-red-500 text-xs mt-2 hidden"></p>
                </div>
            </div>
        </div>`;

        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
    },

    renderComments(comments, slug) {
        if (comments.length === 0) {
            return '<p class="text-sm text-emerald-600/50 text-center py-4">No comments yet. Be the first to share your thoughts!</p>';
        }
        return comments.map((c, i) => `
            <div class="flex gap-3 ${i > 0 ? 'pt-4 border-t border-emerald-50' : ''}">
                <div class="w-8 h-8 rounded-full ${this.getAvatarColor(c.name)} flex-shrink-0 flex items-center justify-center text-[10px] font-bold">${this.getInitials(c.name)}</div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-sm font-semibold text-emerald-900">${c.name}</span>
                        <span class="text-[10px] text-emerald-600/40">${this.formatDate(c.date)}</span>
                    </div>
                    <p class="text-sm text-emerald-900/70 leading-relaxed">${c.text}</p>
                    ${c.likes !== undefined ? `
                    <button onclick="Blog.likeComment('${slug}', ${i})" class="mt-1.5 flex items-center gap-1 text-xs text-emerald-600/40 hover:text-emerald-600 transition-colors" id="commentLike_${slug}_${i}">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"></path><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                        <span id="commentLikeCount_${slug}_${i}">${c.likes}</span>
                    </button>` : ''}
                </div>
            </div>
        `).join('');
    },

    toggleLike(slug) {
        if (this.userLikes[slug]) {
            delete this.userLikes[slug];
        } else {
            this.userLikes[slug] = true;
        }
        this.saveUserData();

        const post = this.getPost(slug);
        const isLiked = !!this.userLikes[slug];
        const totalLikes = this.getLikesCount(post);

        const btn = document.getElementById('likeBtn_' + slug);
        const count = document.getElementById('likeCount_' + slug);
        if (btn && count) {
            btn.className = `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${isLiked ? 'bg-red-50 text-red-500 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100'}`;
            btn.querySelector('svg').setAttribute('fill', isLiked ? 'currentColor' : 'none');
            count.textContent = totalLikes;
        }

        // Also re-render card grid to update like icon
        this.renderBlogSection();
    },

    likeComment(slug, commentIndex) {
        if (!this.userComments[slug]) this.userComments[slug] = [];
        // User-added comments are appended after original comments
        // commentIndex here refers to the merged array
        const post = this.getPost(slug);
        const originalCount = (post.comments || []).length;
        const key = document.getElementById('commentLikeCount_' + slug + '_' + commentIndex);
        if (key) {
            const current = parseInt(key.textContent) || 0;
            key.textContent = current + 1;
        }
    },

    addComment(slug) {
        const nameInput = document.getElementById('commentName_' + slug);
        const textInput = document.getElementById('commentText_' + slug);
        const errorEl = document.getElementById('commentError_' + slug);

        const name = (nameInput?.value || '').trim();
        const text = (textInput?.value || '').trim();

        if (!name || !text) {
            if (errorEl) {
                errorEl.textContent = 'Please enter your name and comment.';
                errorEl.classList.remove('hidden');
            }
            return;
        }

        if (errorEl) errorEl.classList.add('hidden');

        const newComment = {
            name: name,
            text: text,
            date: new Date().toISOString().split('T')[0],
            likes: 0
        };

        if (!this.userComments[slug]) this.userComments[slug] = [];
        this.userComments[slug].push(newComment);
        this.saveUserData();

        // Re-render comments list
        const post = this.getPost(slug);
        const allComments = this.getComments(post);
        const listEl = document.getElementById('commentsList_' + slug);
        if (listEl) {
            listEl.innerHTML = this.renderComments(allComments, slug);
            listEl.scrollTop = listEl.scrollHeight;
        }

        // Clear form
        if (nameInput) nameInput.value = '';
        if (textInput) textInput.value = '';

        // Re-render card grid to update comment count
        this.renderBlogSection();
    },

    closeModal() {
        const modal = document.getElementById('blogModal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = '';
    }
};
