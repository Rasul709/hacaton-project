import os
import subprocess
import datetime
import shutil

def main():
    print("Starting export of HR-Digital sources...")
    
    # Identify desktop directories
    home = os.path.expanduser('~')
    onedrive_desktop = os.path.join(home, 'OneDrive', 'Desktop')
    regular_desktop = os.path.join(home, 'Desktop')

    dest_dirs = []
    if os.path.exists(onedrive_desktop):
        dest_dirs.append(onedrive_desktop)
    if os.path.exists(regular_desktop):
        dest_dirs.append(regular_desktop)
    else:
        try:
            os.makedirs(regular_desktop, exist_ok=True)
            dest_dirs.append(regular_desktop)
        except Exception:
            pass

    dest_dirs.append(os.path.abspath('.'))

    # Identify files via git
    git_files = subprocess.check_output(
        ['git', 'ls-files', '--cached', '--others', '--exclude-standard'], 
        text=True
    ).splitlines()
    git_files = [f.replace('\\', '/') for f in git_files]
    
    binary_exts = {'.png', '.jpg', '.jpeg', '.gif', '.ico', '.woff', '.woff2', '.ttf', '.eot'}
    excluded = {'package-lock.json', 'public/digital_hr_core_30.html'}

    all_files = [f for f in git_files if os.path.splitext(f)[1].lower() not in binary_exts and f not in excluded]
    if os.path.exists('database/data.json') and 'database/data.json' not in all_files:
        all_files.append('database/data.json')

    def categorize(path):
        if path in ['package.json', 'vite.config.ts', 'tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json', 'vercel.json', 'Dockerfile', 'docker-compose.yml', 'nginx.conf', '.oxlintrc.json'] or path.startswith('.env') or path.startswith('.docker') or path == '.gitignore':
            return (1, 'Configuration & Build')
        if path.startswith('database/'):
            return (2, 'Database & Seeds')
        if path.startswith('server/'):
            return (3, 'Backend Server (Express & Storage)')
        if path.startswith('src/types/') or path.startswith('src/app/') or path in ['src/main.tsx', 'src/index.css']:
            return (4, 'Frontend Core & Router')
        if path.startswith('src/components/'):
            return (5, 'Frontend Components (UI & Layout)')
        if path.startswith('src/features/'):
            return (6, 'Frontend Features & Pages')
        if path.startswith('src/lib/'):
            return (7, 'Frontend Libs & Utilities')
        if path.startswith('scripts/') or path.startswith('ci/'):
            return (8, 'Scripts & CI')
        if path.startswith('docs/') or path in ['README.md', 'GEMINI.md'] or path.startswith('.agents/'):
            return (9, 'Documentation & Architecture')
        return (10, 'Public & Static Assets')

    all_files.sort(key=lambda p: (categorize(p), p))

    file_records = []
    total_lines = 0
    total_bytes = 0

    for rel_path in all_files:
        try:
            with open(rel_path, 'r', encoding='utf-8', errors='replace') as f:
                content = f.read()
        except Exception as e:
            content = f'[Error reading file: {e}]'
        
        line_count = len(content.splitlines())
        byte_count = len(content.encode('utf-8'))
        total_lines += line_count
        total_bytes += byte_count
        cat_num, cat_name = categorize(rel_path)
        file_records.append({
            'path': rel_path,
            'category': cat_name,
            'lines': line_count,
            'bytes': byte_count,
            'content': content
        })

    now_str = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # 1. GENERATE TXT VERSION
    txt_lines = []
    txt_lines.append('=' * 80)
    txt_lines.append('DIGITAL HR BY JANA POST — FULL SOURCE CODE REPOSITORY CONSOLIDATION')
    txt_lines.append('=' * 80)
    txt_lines.append(f'Generated: {now_str}')
    txt_lines.append('Repository: https://github.com/Rasul709/hacaton-project (branch: main)')
    txt_lines.append(f'Total Files: {len(file_records)}')
    txt_lines.append(f'Total Lines: {total_lines:,}')
    txt_lines.append(f'Total Size: {total_bytes / 1024:.2f} KB ({total_bytes / (1024*1024):.2f} MB)')
    txt_lines.append('')
    txt_lines.append('NOTE: All functional source code, components, backend server, database schemas,')
    txt_lines.append('seeds, documentation, configuration, and scripts are included in this single file.')
    txt_lines.append('`package-lock.json` and binary assets are omitted to maintain clean code readability.')
    txt_lines.append('')
    txt_lines.append('=' * 80)
    txt_lines.append('TABLE OF CONTENTS')
    txt_lines.append('=' * 80)

    current_cat = None
    idx = 1
    for rec in file_records:
        if rec['category'] != current_cat:
            current_cat = rec['category']
            txt_lines.append(f'\n--- [ {current_cat.upper()} ] ---')
        txt_lines.append(f"{idx:3d}. {rec['path']: <55} ({rec['lines']:4d} lines, {rec['bytes']:6d} bytes)")
        idx += 1

    txt_lines.append('\n' + '=' * 80)
    txt_lines.append('SOURCE CODE FILES')
    txt_lines.append('=' * 80)

    for idx, rec in enumerate(file_records, 1):
        txt_lines.append('\n' + '=' * 80)
        txt_lines.append(f"FILE #{idx}/{len(file_records)}: {rec['path']}")
        txt_lines.append(f"CATEGORY: {rec['category']}")
        txt_lines.append(f"LINES: {rec['lines']} | BYTES: {rec['bytes']}")
        txt_lines.append('=' * 80)
        txt_lines.append(rec['content'])
        if not rec['content'].endswith('\n'):
            txt_lines.append('')
        txt_lines.append('-' * 80)
        txt_lines.append(f"END OF FILE: {rec['path']}")
        txt_lines.append('-' * 80)

    txt_content = '\n'.join(txt_lines)

    # 2. GENERATE MD VERSION
    md_lines = []
    md_lines.append('# Digital HR by Jana Post — Full Source Code Dump')
    md_lines.append('')
    md_lines.append(f'> **Generated:** `{now_str}`  ')
    md_lines.append('> **Repository:** [https://github.com/Rasul709/hacaton-project](https://github.com/Rasul709/hacaton-project) (`main`)  ')
    md_lines.append(f"> **Total Files:** `{len(file_records)}` | **Total Lines:** `{total_lines:,}` | **Total Size:** `{total_bytes / 1024:.2f} KB`")
    md_lines.append('')
    md_lines.append('## Table of Contents')
    md_lines.append('')

    ext_map = {
        '.ts': 'typescript',
        '.tsx': 'tsx',
        '.js': 'javascript',
        '.jsx': 'jsx',
        '.json': 'json',
        '.css': 'css',
        '.html': 'html',
        '.sql': 'sql',
        '.prisma': 'prisma',
        '.md': 'markdown',
        '.yml': 'yaml',
        '.yaml': 'yaml',
        '.conf': 'nginx',
    }

    current_cat = None
    idx = 1
    for rec in file_records:
        if rec['category'] != current_cat:
            current_cat = rec['category']
            md_lines.append(f'\n### {current_cat}\n')
        anchor = rec['path'].replace('/', '-').replace('.', '-').lower()
        md_lines.append(f"{idx}. [{rec['path']}](#{anchor}) — *{rec['lines']} lines, {rec['bytes']} bytes*")
        idx += 1

    md_lines.append('\n---\n')
    md_lines.append('## Source Code Files\n')

    for idx, rec in enumerate(file_records, 1):
        ext = os.path.splitext(rec['path'])[1].lower()
        lang = ext_map.get(ext, '')
        if rec['path'] == 'Dockerfile' or rec['path'].endswith('Dockerfile'):
            lang = 'dockerfile'
        elif rec['path'].startswith('.env'):
            lang = 'ini'
        elif rec['path'].endswith('.gitignore') or rec['path'].endswith('.dockerignore'):
            lang = 'gitignore'
        
        anchor = rec['path'].replace('/', '-').replace('.', '-').lower()
        md_lines.append(f'### <a id="{anchor}"></a>{idx}. `{rec["path"]}`')
        md_lines.append(f"**Category:** {rec['category']} | **Lines:** {rec['lines']} | **Size:** {rec['bytes']} bytes\n")
        md_lines.append('`````' + lang)
        md_lines.append(rec['content'])
        if not rec['content'].endswith('\n'):
            md_lines.append('')
        md_lines.append('`````\n')

    md_content = '\n'.join(md_lines)

    # Write files to target directories
    for target_dir in dest_dirs:
        txt_path = os.path.join(target_dir, 'HR_Digital_All_Sources.txt')
        md_path = os.path.join(target_dir, 'HR_Digital_All_Sources.md')
        
        with open(txt_path, 'w', encoding='utf-8') as f:
            f.write(txt_content)
        with open(md_path, 'w', encoding='utf-8') as f:
            f.write(md_content)
            
        print(f"Successfully written:")
        print(f"  -> {txt_path} ({os.path.getsize(txt_path) / 1024:.1f} KB)")
        print(f"  -> {md_path} ({os.path.getsize(md_path) / 1024:.1f} KB)")

if __name__ == '__main__':
    main()
