import re

with open('views/new_games.html', 'r') as f:
    content = f.read()

# Update top bar to be a white card
old_top_bar = """<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                        <div>
                            <h3 class="text-lg font-bold text-gray-900">New Games</h3>
                            <p class="text-xs text-gray-500" id="new-games-month-label">Showing games for the current month.</p>
                        </div>
                        <div class="flex items-center space-x-2 bg-white rounded-lg border border-slate-200/60 p-1 shadow-sm">
                            <button type="button" onclick="window.changeGameMonth(-1)" class="p-1.5 rounded text-gray-500 hover:bg-slate-100 hover:text-gray-700 transition-colors"><i class="fa-solid fa-chevron-left"></i></button>
                            <button type="button" onclick="window.resetGameMonth()" class="px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-slate-100 transition-colors">Today</button>
                            <button type="button" onclick="window.changeGameMonth(1)" class="p-1.5 rounded text-gray-500 hover:bg-slate-100 hover:text-gray-700 transition-colors"><i class="fa-solid fa-chevron-right"></i></button>
                        </div>
                    </div>"""

new_top_bar = """<div class="bg-white rounded-xl shadow-md shadow-slate-200/50 border border-slate-200/60 mb-6 p-4 sm:p-5 flex justify-between items-center">
                    <div>
                        <h3 class="text-lg font-bold text-gray-900">New Games</h3>
                        <p class="text-xs text-gray-500" id="new-games-month-label">Showing games for the current month.</p>
                    </div>
                    <div class="flex items-center space-x-2 bg-slate-50 rounded-lg border border-slate-200/60 p-1 shadow-sm">
                        <button type="button" onclick="window.changeGameMonth(-1)" class="p-1.5 rounded text-gray-500 hover:bg-slate-200 hover:text-gray-700 transition-colors"><i class="fa-solid fa-chevron-left"></i></button>
                        <button type="button" onclick="window.resetGameMonth()" class="px-3 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-slate-200 transition-colors">Today</button>
                        <button type="button" onclick="window.changeGameMonth(1)" class="p-1.5 rounded text-gray-500 hover:bg-slate-200 hover:text-gray-700 transition-colors"><i class="fa-solid fa-chevron-right"></i></button>
                    </div>
                </div>"""

content = content.replace(old_top_bar, new_top_bar)

# Remove the 3-column detailed view and empty state
new_content_area = """                <!-- 3-COLUMN LAYOUT -->
                <div id="game-content-area" class="hidden grid-cols-1 lg:grid-cols-4 gap-6">

                    <!-- 50%: Visuals & Links (Spans 2 columns) -->
                    <div class="bg-white rounded-xl shadow-md shadow-slate-200/50 border border-slate-200/60 flex flex-col lg:col-span-2">
                        <div class="px-4 py-3 border-b border-slate-200/60 bg-slate-50 rounded-t-lg flex justify-between items-center">
                            <h4 class="text-sm font-bold text-gray-900"><i class="fa-regular fa-image mr-2 text-indigo-500"></i>Creatives & Links</h4>
                            <span id="game-carousel-counter" class="text-xs font-medium text-gray-500">0 / 0</span>
                        </div>
                        <div class="p-4 flex-1 flex flex-col items-center justify-center relative min-h-[500px]" id="game-carousel-container">
                        </div>
                    </div>

                    <!-- 25%: Execution Summary (Spans 1 column) -->
                    <div class="bg-white rounded-xl shadow-md shadow-slate-200/50 border border-slate-200/60 flex flex-col lg:col-span-1" id="game-stats-container">
                    </div>

                    <!-- 25%: Post Performance (Spans 1 column) -->
                    <div class="bg-white rounded-xl shadow-md shadow-slate-200/50 border border-slate-200/60 flex flex-col lg:col-span-1" id="game-performance-container">
                    </div>

                </div>

                <div id="game-empty-state" class="bg-white rounded-xl shadow-md shadow-slate-200/50 border border-slate-200/60 p-12 text-center mt-6">
                    <div class="inline-flex items-center justify-center h-20 w-20 rounded-full bg-slate-100 mb-4">
                        <i class="fa-solid fa-bullseye text-3xl text-gray-400"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900">No Game Selected</h3>
                    <p class="text-gray-500 text-sm mt-1">Please select a game from the cards above to view its details.</p>
                </div>"""

content = content.replace(new_content_area, "")

with open('views/new_games.html', 'w') as f:
    f.write(content)
