#!/usr/bin/env python3
import json, requests, time, array, yaml

#IP of Hue hub
hue_ip="192.168.1.5"

#API user key for Hue hub
api_key="MZk4CALygJdoNboE1dalDeEZP5TQPTLLG0FOshOQ"

#Arrays storing all the different areas and their lighting status
area_arr=[]
area_lit=[]

#Read room layout from room_setup.yaml
areas = yaml.load(open('room_setup.yaml'), Loader=yaml.FullLoader)
for area in areas.items():
    area_arr.append(set(area[1]['lights']))
    area_lit.append(bool(area[1]['lit']))

#Lights which are turned on, will be updated via get_lit_lights()
lit_lights=set()

#Send a html PUT command to the hue hub, area specifies which bulbs are affected
def execute_light_command(area, command):
    for bulb_id in area:
        c=json.loads(command)
        state_on_req = bool(c['on'])
        state_sat_req = int(c['sat'])
        state_bri_req = int(c['bri'])
        state_hue_req = int(c['hue'])
        state_ct_req = int(c['ct'])
        command_executed = False
        #While the command is not executed correctly (controled via getting the lights state), the command will be resent
        while not command_executed:
            requests.put("http://"+hue_ip+"/api/"+api_key+"/lights/"+str(bulb_id)+"/state/", data=json.dumps(c))
            time.sleep(0.1)
            r=requests.get("http://"+hue_ip+"/api/"+api_key+"/lights/"+str(bulb_id))
            state_on = bool(r.json()['state']['on'])
            state_sat = int(r.json()['state']['sat'])
            state_bri = int(r.json()['state']['bri'])
            state_hue = int(r.json()['state']['hue'])
            state_ct = int(r.json()['state']['ct'])
            if ((state_on == state_on_req) & (state_sat == state_sat_req) & (state_bri == state_bri_req) & (state_hue == state_hue_req) & (state_ct == state_ct_req)) | ((state_on == state_on_req) & (state_on_req == False)):
                command_executed = True
    return

#Get all lights which are lit
def get_lit_lights():
    lit_lights.clear()
    for  bulb_id in area_arr[0]:
        r=requests.get("http://"+hue_ip+"/api/"+api_key+"/lights/"+str(bulb_id))
        data = bool(r.json()['state']['on'])
        if data == True:
            lit_lights.add(bulb_id)
    return

#Turning on lights in an area which are not lit
def turn_on_area(area_id,light_command):
    get_lit_lights()
    execute_light_command(area_arr[area_id].difference(lit_lights), light_command)
    #If the whole room is getting lit, then each area is lit as well
    if area_id == 0:
        for id,val in enumerate(area_arr):
            area_lit[id]=True
    else:
        area_lit[area_id] = True
        room_test = True
        #Check if last area was lit, then light the whole room
        for id,val in enumerate(area_arr):
            if (area_lit[id]==False) & (id != 0):
                room_test = False
        if room_test:
            area_lit[0]=True
    return

#Turning off an area without affecting other areas
def turn_off_area(area_id):
    turn_off=set()
    if area_id != 0:
        for id, val in enumerate(area_arr):
            #Check which lights don't belong to another lit area
            if (id !=0) & (id != area_id) & (area_lit[id]):
                turn_off=turn_off.union(area_arr[id]&area_arr[area_id])
    turn_off=area_arr[area_id]-turn_off
    light_command = '{"on": false, "sat":0, "hue":0, "bri":254, "ct": 153}'
    execute_light_command(turn_off, light_command)
    if area_id == 0:
        #If the whole room is getting turned off, then each area is turned off as well
        for id,val in enumerate(area_arr):
            area_lit[id]=False
    else:
        #If a single area is turned off, then the whole room isn't turned on anymore
        area_lit[0] = False
        area_lit[area_id] = False
    return

#Transition color temperature, should only be used with the whole room, otherwise inequal lighting conditions can occur over a single area
#Request from 0 (Midday) to 1 (Dawn/Dusk), time in s
def daytime(area_id, request, time):
    #Hue uses 1/10 of s
    time=time*10
    get_lit_lights()
    ct=153+request*347
    light_command = '{"on": true, "sat":0, "hue":0, "bri":254, "ct": '+str(ct)+', "transitiontime": '+str(time)+'}'
    execute_light_command(area_arr[area_id].intersection(lit_lights), light_command)
    return

###################################################################################
#                        Code to command the room                                 #
###################################################################################

print("Room is being reset, please wait")
turn_off_area(0)
print("The room is now reset")

light_command = '{"on": true, "sat":0, "hue":0, "bri":254, "ct": 153, "transitiontime": 10}'
turn_on_area(0, light_command)
print("The room is turned back on")
