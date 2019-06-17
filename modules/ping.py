import os, subprocess

up=[]
ping=[]
for i in range (1,55):
    if i<10:
        hostname = "watchtower0"+str(i)
        # hostname2 = "autobot0"+str(i)
    else:
        hostname = "watchtower"+str(i)
        # hostname2 = "autobot"+str(i)
    proc = subprocess.Popen(["ping", "-c", "1", hostname], stdout=subprocess.PIPE)
    proc.wait()
    if proc.poll() == 0:
        out = proc.stdout.read().decode("utf-8")
        tmp = out[out.find('mdev'):]
        tmp2= tmp[tmp.find('/')+1:]
        tmp3= tmp2[:tmp2.find('/')]
        up.append(hostname)
        ping.append(tmp3)
    # proc = subprocess.Popen(["ping", "-c", "1", hostname2], stdout=subprocess.PIPE)
    # proc.wait()
    # if proc.poll() == 0:
    #     out = proc.stdout.read().decode("utf-8")
    #     tmp = out[out.find('mdev'):]
    #     tmp2= tmp[tmp.find('/')+1:]
    #     tmp3= tmp2[:tmp2.find('/')]
    #     up.append(hostname2)
    #     ping.append(tmp3)

print(ping)
print(up)
