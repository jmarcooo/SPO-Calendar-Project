with open("views/campaign.html", "r") as f:
    content = f.read()

new_html = """
            <div id="view-campaign" >
                <div class="bg-white rounded-xl shadow-md shadow-slate-200/50 border border-slate-200/60 mb-6 p-4 sm:p-5 flex justify-between items-center">
                    <div>
                        <h3 class="text-lg font-bold text-gray-900">SPO team posts</h3>
                        <p class="text-xs text-gray-500">Record and manage SPO team posts.</p>
                    </div>
                    <div>
                        <button onclick="window.openSPOTeamPostModal()" class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-md shadow-slate-200/50 text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                            <i class="fa-solid fa-plus mr-2"></i> Add Post
                        </button>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-md shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-slate-200/60">
                            <thead class="bg-slate-50">
                                <tr>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100" onclick="window.sortSPOTeamPosts('title')">
                                        Title <i class="fa-solid fa-sort ml-1 text-gray-400"></i>
                                    </th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100" onclick="window.sortSPOTeamPosts('datePosted')">
                                        Date Posted <i class="fa-solid fa-sort ml-1 text-gray-400"></i>
                                    </th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100" onclick="window.sortSPOTeamPosts('createdBy')">
                                        Created By <i class="fa-solid fa-sort ml-1 text-gray-400"></i>
                                    </th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100" onclick="window.sortSPOTeamPosts('accountUsed')">
                                        Account Used <i class="fa-solid fa-sort ml-1 text-gray-400"></i>
                                    </th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Post URL
                                    </th>
                                </tr>
                            </thead>
                            <tbody id="spo-team-posts-tbody" class="bg-white divide-y divide-slate-100">
                                <!-- Dynamic rows -->
                            </tbody>
                        </table>
                    </div>
                    <div id="spo-team-posts-empty" class="p-8 text-center text-gray-500 hidden">
                        <p>No posts recorded yet.</p>
                    </div>
                </div>
            </div>
"""

with open("views/campaign.html", "w") as f:
    f.write(new_html)
