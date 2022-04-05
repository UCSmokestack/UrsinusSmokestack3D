import glob

fout = open("allAnnotations.json", "w")

fout.write("[")

files = glob.glob("*.json")
for i, filename in enumerate(files):
    fin = open(filename)
    fout.write(fin.read())
    fin.close()
    if i < len(files)-1:
        fout.write(",")

fout.write("]")

fout.close()