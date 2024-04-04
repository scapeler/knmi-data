library(methods)
library(bitops)
# install.packages("ncdf4")
library(ncdf4)
# install.packages("RCurl")
library(RCurl)

ncname <- "knmi_tmp_10min_actual_data"
ncfname <- paste("/opt/SCAPE604/knmi_files/", ncname, ".nc", sep = "")
# ncfname <- paste('~/projects/SCAPE604/knmi_files/',ncname, ".nc", sep = "")

# open a NetCDF file
ncin <- nc_open(ncfname)

station <- ncvar_get(ncin, "station")
stationName <- ncvar_get(ncin, "stationname")
lat <- ncvar_get(ncin, "lat")
lon <- ncvar_get(ncin, "lon")
height <- ncvar_get(ncin, "height")

dd <- ncvar_get(ncin, "dd")
ff <- ncvar_get(ncin, "ff")
pp <- ncvar_get(ncin, "pp")
D1H <- ncvar_get(ncin, "D1H")
R1H <- ncvar_get(ncin, "R1H")
td <- ncvar_get(ncin, "td")
ta <- ncvar_get(ncin, "ta")
rh <- ncvar_get(ncin, "rh")
qg <- ncvar_get(ncin, "qg")

t <- ncvar_get(ncin, "time")
tunits <- ncatt_get(ncin, "time", "units")

tustr <- strsplit(tunits$value, " ")  # "seconds since 1950-01-01 00:00:00"
tmp <- unlist(tustr)[3]               # strip "1950-01-01"
tijd <- as.POSIXct(tmp, format = "%Y-%m-%d", tz = "GMT")  # convert "1950-01-01" to time.
tijd2 <- strftime((tijd + t), "%Y-%m-%dT%H:%M:%S.000Z")  # 1950-01-01 + time -> UTC time in iso format

dfKnmi <- data.frame(
    station,
    stationName,
    t,
    tunits,
    tijd2,
    lat,
    lon,
    height,
    dd,
    ff,
    pp,
    D1H,
    R1H,
    td,
    ta,
    rh,
    qg
)

nc_close(ncin)

print(station)

a <- paste0(jsonlite::toJSON(dfKnmi), sep = "")
class(a) <- "json"
write(a, "/tmp/output.json")
quit(save = "no", status = 0)
