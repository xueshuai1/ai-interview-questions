import re, json

# Load API results
with open('update-results.json') as f:
    data = json.load(f)
results = {r['ownerRepo']: r for r in data['results']}

# Read tools.ts
with open('src/data/tools.ts', 'r') as f:
    content = f.read()

changes = []

# Find all tool objects with their positions
# Strategy: find each url: "https://github.com/..." and work backwards to find the {
pattern = r'url:\s*"https://github\.com/([^"]+)"'
matches = list(re.finditer(pattern, content))

processed_positions = set()

for m in matches:
    repo = m.group(1)
    api = results.get(repo)
    if not api:
        continue
    
    url_pos = m.start()
    
    # Find the start of this tool object
    depth = 0
    start = url_pos
    while start >= 0:
        if content[start] == '}':
            depth += 1
        elif content[start] == '{':
            if depth == 0:
                break
            depth -= 1
        start -= 1
    
    # Find the end of this tool object
    depth = 0
    in_str = False
    escape = False
    end = url_pos
    while end < len(content):
        ch = content[end]
        if escape:
            escape = False
            end += 1
            continue
        if ch == '\\':
            escape = True
            end += 1
            continue
        if ch == '"':
            in_str = not in_str
        elif not in_str:
            if ch == '{':
                depth += 1
            elif ch == '}':
                depth -= 1
                if depth == 0:
                    break
        end += 1
    
    end += 1  # include the }
    block = content[start:end]
    
    tool_id_m = re.search(r'id:\s*"([^"]+)"', block)
    if not tool_id_m:
        continue
    tool_id = tool_id_m.group(1)
    
    new_block = block
    modified = False
    
    # Update githubStars
    stars_m = re.search(r'githubStars:\s*(\d+)', new_block)
    if stars_m and int(stars_m.group(1)) != api['stars']:
        old_val = int(stars_m.group(1))
        new_block = re.sub(r'githubStars:\s*\d+', f'githubStars: {api["stars"]}', new_block)
        changes.append({'id': tool_id, 'field': 'stars', 'old': old_val, 'new': api['stars'], 'diff': api['stars'] - old_val})
        modified = True
    
    # Update forks
    forks_m = re.search(r'forks:\s*(\d+)', new_block)
    if forks_m and int(forks_m.group(1)) != api['forks']:
        new_block = re.sub(r'forks:\s*\d+', f'forks: {api["forks"]}', new_block)
        changes.append({'id': tool_id, 'field': 'forks', 'old': int(forks_m.group(1)), 'new': api['forks']})
        modified = True
    elif not forks_m and api['forks'] > 0:
        # Add forks after githubStars
        if 'githubStars' in new_block:
            new_block = re.sub(r'(githubStars:\s*\d+)', rf'\1,\n    forks: {api["forks"]}', new_block)
            changes.append({'id': tool_id, 'field': 'forks', 'old': None, 'new': api['forks']})
            modified = True
    
    # Update language
    lang_m = re.search(r'language:\s*"([^"]+)"', new_block)
    if lang_m and api.get('language') and api['language'] != 'None' and lang_m.group(1) != api['language']:
        new_block = re.sub(r'language:\s*"[^"]+"', f'language: "{api["language"]}"', new_block)
        changes.append({'id': tool_id, 'field': 'language', 'old': lang_m.group(1), 'new': api['language']})
        modified = True
    elif not lang_m and api.get('language') and api['language'] != 'None':
        if 'createdAt' in new_block:
            new_block = re.sub(r'(createdAt:\s*"[^"]+")', rf'\1,\n    language: "{api["language"]}"', new_block)
        elif 'githubStars' in new_block:
            new_block = re.sub(r'(githubStars:\s*\d+)', rf'\1,\n    language: "{api["language"]}"', new_block)
        changes.append({'id': tool_id, 'field': 'language', 'old': None, 'new': api['language']})
        modified = True
    
    # Update updatedAt
    if api.get('pushedAt'):
        date_str = api['pushedAt'].split('T')[0]
        update_m = re.search(r'updatedAt:\s*"([^"]+)"', new_block)
        if update_m and update_m.group(1) != date_str:
            new_block = re.sub(r'updatedAt:\s*"[^"]+"', f'updatedAt: "{date_str}"', new_block)
            changes.append({'id': tool_id, 'field': 'updatedAt', 'old': update_m.group(1), 'new': date_str})
            modified = True
    
    if modified:
        content = content[:start] + new_block + content[end:]
        print(f"  Updated {tool_id}")

# Write updated content
with open('src/data/tools.ts', 'w') as f:
    f.write(content)

# Summary
star_changes = [c for c in changes if c['field'] == 'stars']
star_changes.sort(key=lambda x: abs(x['diff']), reverse=True)
print(f"\n=== Summary ===")
print(f"Total changes: {len(changes)}")
print(f"Stars updated: {len(star_changes)}")
for c in star_changes[:10]:
    sign = '+' if c['diff'] > 0 else ''
    print(f"  {c['id']}: {c['old']:,} → {c['new']:,} ({sign}{c['diff']:,})")

fork_changes = [c for c in changes if c['field'] == 'forks']
print(f"Forks updated: {len(fork_changes)}")

lang_changes = [c for c in changes if c['field'] == 'language']
print(f"Language updated: {len(lang_changes)}")
