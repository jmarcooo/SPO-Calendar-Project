import re

with open('index.html', 'r') as f:
    content = f.read()

game_drawer_html = """
    <!-- Game Settings Drawer -->
    <div id="game-drawer-overlay" class="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 hidden transition-opacity duration-300 opacity-0" onclick="window.closeGameDrawer()"></div>
    <div id="game-drawer" class="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl transform translate-x-full transition-transform duration-300 ease-in-out z-50 flex flex-col border-l border-slate-200/60">

        <!-- Header -->
        <div class="px-6 py-5 border-b border-slate-200/60 flex justify-between items-center bg-white sticky top-0 z-10">
            <div>
                <h2 id="game-drawer-title" class="text-xl font-bold text-gray-900 leading-tight">Game Settings</h2>
                <p class="text-sm text-gray-500 mt-1">Update game details and launch dates.</p>
            </div>
            <button type="button" onclick="window.closeGameDrawer()" class="text-gray-400 hover:text-gray-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors">
                <i class="fa-solid fa-xmark text-lg"></i>
            </button>
        </div>

        <!-- Scrollable Content -->
        <div class="p-6 flex-1 overflow-y-auto bg-slate-50 space-y-6">
            <input type="hidden" id="game-drawer-id">

            <div class="space-y-4 bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm">
                <h3 class="text-sm font-bold text-gray-900 border-b border-slate-100 pb-2"><i class="fa-solid fa-image text-indigo-500 mr-2"></i>Visuals</h3>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Icon Image URL</label>
                    <input type="url" id="game-drawer-icon" placeholder="https://example.com/icon.png" class="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <p class="text-xs text-gray-500 mt-1">Square image for the game icon.</p>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Game Review Banner URL</label>
                    <input type="url" id="game-drawer-banner" placeholder="https://example.com/banner.jpg" class="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <p class="text-xs text-gray-500 mt-1">Rectangular image for the game banner.</p>
                </div>
            </div>

            <div class="space-y-4 bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm">
                <h3 class="text-sm font-bold text-gray-900 border-b border-slate-100 pb-2"><i class="fa-solid fa-calendar-days text-indigo-500 mr-2"></i>Launch Details</h3>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Official Launch Date</label>
                    <input type="datetime-local" step="1" id="game-drawer-launch" class="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <p class="text-xs text-gray-500 mt-1">Confirm the official launch date here. This is separate from the target creation date.</p>
                </div>
            </div>

        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-slate-200/60 bg-white flex justify-end gap-3 sticky bottom-0">
            <button type="button" onclick="window.closeGameDrawer()" class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">Cancel</button>
            <button type="button" onclick="window.saveGameDrawer()" class="px-4 py-2 bg-indigo-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-indigo-700 shadow-sm transition-colors flex items-center"><i class="fa-solid fa-check mr-2"></i>Save Settings</button>
        </div>
    </div>
"""

# Insert before closing body tag
content = content.replace("</body>", game_drawer_html + "\n</body>")

with open('index.html', 'w') as f:
    f.write(content)
