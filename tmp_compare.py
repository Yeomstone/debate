import os
root_argu = r'D:/vs/Argu'
root_debate = r'D:/vs/Debate'
missing = []
for dirpath, _, files in os.walk(root_argu):
    for f in files:
        if f.lower().endswith('.css'):
            rel = os.path.relpath(os.path.join(dirpath, f), root_argu)
            candidate = rel.replace('ArguAdmin', 'DebateAdmin').replace('ArguUser', 'DebateUser')
            candidate = candidate.replace('argu', 'debate').replace('Argu', 'Debate')
            path = os.path.join(root_debate, candidate)
            if not os.path.exists(path):
                missing.append((rel, os.path.relpath(path, root_debate)))
print('Missing count:', len(missing))
for rel, cand in missing:
    print(rel, '->', cand)
