import os, subprocess

watchtowers_up=[]
watchtowers_ping=[]
for i in range (1,20):
    if i<10:
        hostname = "watchtower0"+str(i)
    else:
        hostname = "watchtower"+str(i)
    proc = subprocess.Popen(["ping", "-c", "1", hostname], stdout=subprocess.PIPE)
    proc.wait()
    if proc.poll() == 0:
        out = proc.stdout.read().decode("utf-8")
        tmp = out[out.find('mdev'):]
        tmp2= tmp[tmp.find('/')+1:]
        tmp3= tmp2[:tmp2.find('/')]
        watchtowers_up.append(hostname)
        watchtowers_ping.append(tmp3)

print(watchtowers_ping)        
print(watchtowers_up)
