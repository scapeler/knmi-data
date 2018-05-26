#install.packages("ncdf4")
library(ncdf4)

ncname<-"knmi_tmp_10min_actual_data"
ncfname <- paste('/opt/SCAPE604/knmi_files/',ncname, ".nc", sep = "")

# open a NetCDF file
ncin <- nc_open(ncfname)

dd <- ncvar_get(ncin, "dd")
ff <- ncvar_get(ncin, "ff")

t <- ncvar_get(ncin, "time")
tunits <- ncatt_get(ncin, "time", "units")

tustr <- strsplit(tunits$value, " ")
tmp<-unlist(tustr)[3]
tijd<-as.POSIXct(tmp, format="%Y-%m-%d")
tijd2<-tijd+t
t
ncvar_get(ncin, "time")
stns <-ncvar_get(ncin, "station")
stns[2:5]
stnsname<-ncvar_get(ncin, "stationname")
stns[stnsname=='HOEK VAN HOLLAND AWS']
stns[stns=='06330']
dd[stns=='06330']  # windrichting in graden 10 minute gemiddelde
#ff[stns=='06330']  # windspeed op 10m 10 minuten gemiddelde

nc_close(ncin)
dd
ff
tijd2

foi<-paste('KNMI','06330',sep='')
observation<-''
url1<-'https://openiod?SERVICE=WPS&REQUEST=Execute&identifier=transform_observation&action=insertom&sensorsystem=apri-sensor-knmi&offering=offering_knmi_initial&commit=true';
url <- paste(url1,'&foi=',foi,'&observation=',observation,'&measurementTime=',tijd2,sep='');
url
