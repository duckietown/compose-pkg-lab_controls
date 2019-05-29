import os

watchtowers_up=[]
for i in range (1,20):
    if i<10:
        hostname = "watchtower0"+str(i)
    else:
        hostname = "watchtower"+str(i)
    response = os.system("ping -c 1 " + hostname)
    if response == 0:
        watchtowers_up.append(hostname)

print(watchtowers_up)
