import re, json

# Load API results
with open('update-results.json') as f:
    data = json.load(f)
results = {r['ownerRepo']: r for r in data['results']}

# Read lines
with open('src/data/tools.ts', 'r') as f:
    lines = f.readlines()

changes = []
current_repo = None
i = 0
while i < len(lines):
    line = lines[i]
    
    # Check for GitHub URL
    url_m = re.search(r'url:\s*"https://github\.com/([^"]+)"', line)
    if url_m:
        current_repo = url_m.group(1)
    
    if current_repo and current_repo in results:
        api = results[current_repo]
        
        # Check for githubStars
        stars_m = re.match(r'(\s*)githubStars:\s*(\d+)(.*)', line)
        if stars_m:
            indent = stars_m.group(1)
            old_stars = int(stars_m.group(2))
            suffix = stars_m.group(3)
            if old_stars != api['stars']:
                lines[i] = f"{indent}githubStars: {api['stars']}{suffix}\n"
                changes.append({'field': 'stars', 'old': old_stars, 'new': api['stars'], 'diff': api['stars'] - old_stars})
                print(f"  stars: {old_stars:,} → {api['stars']:,} (diff: {api['stars'] - old_stars:+,})")
        
        # Check for forks
        forks_m = re.match(r'(\s*)forks:\s*(\d+)(.*)', line)
        if forks_m:
            indent = forks_m.group(1)
            old_forks = int(forks_m.group(2))
            suffix = forks_m.group(3)
            if old_forks != api['forks']:
                lines[i] = f"{indent}forks: {api['forks']}{suffix}\n"
                changes.append({'field': 'forks', 'old': old_forks, 'new': api['forks']})
        
        # Check for language
        lang_m = re.match(r'(\s*)language:\s*"([^"]+)"(.*)', line)
        if lang_m and api.get('language') and api['language'] != 'None':
            indent = lang_m.group(1)
            old_lang = lang_m.group(2)
            suffix = lang_m.group(3)
            if old_lang != api['language']:
                lines[i] = f'{indent}language: "{api["language"]}"{suffix}\n'
                changes.append({'field': 'language', 'old': old_lang, 'new': api['language']})
        
        # Check for updatedAt
        update_m = re.match(r'(\s*)updatedAt:\s*"([^"]+)"(.*)', line)
        if update_m and api.get('pushedAt'):
            indent = update_m.group(1)
            old_date = update_m.group(2)
            suffix = update_m.group(3)
            new_date = api['pushedAt'].split('T')[0]
            if old_date != new_date:
                lines[i] = f'{indent}updatedAt: "{new_date}"{suffix}\n'
                changes.append({'field': 'updatedAt', 'old': old_date, 'new': new_date})
    
    # Reset repo at tool boundary (next tool starts)
    if re.match(r'\s*\{', line) and current_repo:
        # Check if this is a new tool block (contains id:)
        # Look ahead for id:
        found_id = False
        for j in range(i, min(i+20, len(lines))):
            if 'id:' in lines[j]:
                found_id = True
                break
            if 'url:' in lines[j]:
                break
        if found_id:
            # Check if we already found a url in this block
            has_url = False
            for j in range(max(0, i-5), i):
                if 'url:' in lines[j]:
                    has_url = True
                    break
            if not has_url:
                current_repo = None
    
    # Reset at tool block end (}, followed by { or ];)
    if re.match(r'\s*\}\s*,?\s*$', line):
        # Check if next non-empty line starts a new tool
        for j in range(i+1, min(i+5, len(lines))):
            stripped = lines[j].strip()
            if stripped == '':
                continue
            if stripped.startswith('{'):
                # New tool, reset repo
                current_repo = None
            break
    
    i += 1

# Write
with open('src/data/tools.ts', 'w') as f:
    f.writelines(lines)

# Summary
star_changes = [c for c in changes if c['field'] == 'stars']
star_changes.sort(key=lambda x: abs(x['diff']), reverse=True)
print(f"\n=== Summary ===")
print(f"Stars updated: {len(star_changes)}")
for c in star_changes[:10]:
    sign = '+' if c['diff'] > 0 else ''
    print(f"  {c['old']:,} → {c['new']:,} ({sign}{c['diff']:,})")

fork_changes = [c for c in changes if c['field'] == 'forks']
print(f"Forks updated: {len(fork_changes)}")

lang_changes = [c for c in changes if c['field'] == 'language']
print(f"Language updated: {len(lang_changes)}")
