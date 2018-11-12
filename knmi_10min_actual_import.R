
library(methods)
library(bitops)
#install.packages("ncdf4")
library(ncdf4)
#install.packages("RCurl")
library(RCurl)

ncname<-"knmi_tmp_10min_actual_data"
ncfname <- paste('/opt/SCAPE604/knmi_files/',ncname, ".nc", sep = "")
#ncfname <- paste('~/projects/SCAPE604/knmi_files/',ncname, ".nc", sep = "")

# open a NetCDF file
ncin <- nc_open(ncfname)

station<-ncvar_get(ncin, "station")
stationName<-ncvar_get(ncin, "stationname")
lat <- ncvar_get(ncin, "lat")
lon <- ncvar_get(ncin, "lon")
height <- ncvar_get(ncin, "height")

dd <- ncvar_get(ncin, "dd")
ff <- ncvar_get(ncin, "ff")
D1H <- ncvar_get(ncin, "D1H")
R1H <- ncvar_get(ncin, "R1H")
ta <- ncvar_get(ncin, "ta")
rh <- ncvar_get(ncin, "rh")

t <- ncvar_get(ncin, "time")
tunits <- ncatt_get(ncin, "time", "units")

tustr <- strsplit(tunits$value, " ")
tmp<-unlist(tustr)[3]
tijd<-as.POSIXct(tmp, format="%Y-%m-%d")
#tijd2<-tijd+t
tijd2<-strftime((tijd+t-3600) , "%Y-%m-%dT%H:%M:%S")

#ncvar_get(ncin, "time")
stns <-ncvar_get(ncin, "station")
stns[2:5]
#stnsname<-ncvar_get(ncin, "stationname")
#stns[stnsname=='HOEK VAN HOLLAND AWS']
#stns[stns=='06330']
#stationId<-stns[stns=='06330']
#stationIdName<-stnsname[stns=='06330']
ddValue<-dd[stns=='06330']  # windrichting in graden 10 minute gemiddelde
ffValue<-ff[stns=='06330']  # windspeed op 10m 10 minuten gemiddelde
D1HValue<-D1H[stns=='06330']  # duration rainfall last hour
R1HValue<-R1H[stns=='06330']  # rainfall in mm last hour
taValue<-ta[stns=='06330']  # Air Temperature 1 Min Average
rhValue<-rh[stns=='06330']  # Relative Humidity 1 Min Average

nc_close(ncin)

foi<-paste('KNMI','06330',sep='')
observation<-paste('apri-sensor-knmi-dd:',ddValue,sep='')
observation<-paste(observation,',','apri-sensor-knmi-ff:',ffValue,sep='')
observation<-paste(observation,',','apri-sensor-knmi-D1H:',D1HValue,sep='')
observation<-paste(observation,',','apri-sensor-knmi-R1H:',R1HValue,sep='')
observation<-paste(observation,',','apri-sensor-knmi-ta:',taValue,sep='')
observation<-paste(observation,',','apri-sensor-knmi-rh:',rhValue,sep='')
url1<-'https://openiod.org/SCAPE604/openiod?SERVICE=WPS&REQUEST=Execute&identifier=transform_observation&action=insertom&sensorsystem=apri-sensor-knmi10m&offering=offering_knmi10m_initial&commit=true';
url <- paste(url1,'&foi=',foi,'&observation=',observation,'&measurementTime=',tijd2,sep='');
url

# send data to OGC/SOS
myfile <- getURL(url, ssl.verifyhost=FALSE, ssl.verifypeer=FALSE)
# result
myfile

# send data to openiod-fiware-connect-server
url<- "https://fiware-connect.openiod.nl/openiod-fiware-connect/knmi"
#x = postForm(url, ssl.verifyhost=FALSE, ssl.verifypeer=FALSE
#  ,station=station
#  ,time= tijd2
#  ,stationName=stationName
#  ,lat=lat
#  ,lon=lon
#  ,height=height
#  ,dd=dd
#  ,ff=ff
#  ,D1H=D1H
#  ,R1H=R1H
#  ,ta=ta
#  ,rh=rh
#  ,style="POST"
#)
#x


quit(save = "no",status = 0)
