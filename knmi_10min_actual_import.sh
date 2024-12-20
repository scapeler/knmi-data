SYSTEMCODE="SCAPE604"
SYSTEMPATH="/opt"

LOGFILE=$SYSTEMPATH/$SYSTEMCODE/log/knmi_10min_actual_import.log
echo "Start procedure on: " `date` >>$LOGFILE

cd $SYSTEMPATH/$SYSTEMCODE/knmi-data
if [ -f "../knmi_files/knmi_tmp_10min_actual_data.nc" ]; then
  rm ../knmi_files/knmi_tmp_10min_actual_data.nc
fi
node index knmi_10min_actual_import.js >>$LOGFILE 2>>$LOGFILE
if [ -f "../knmi_files/knmi_tmp_10min_actual_data.nc" ]; then
  Rscript knmi_10min_actual_import.R >>$LOGFILE 2>>$LOGFILE
  Rscript knmi_10min_actual_import-v2.R >>$LOGFILE 2>>$LOGFILE
  curl -X POST -H "Content-Type: application/json" -d @/tmp/output.json "https://aprisensor-api-v1.openiod.org/v1/knmi"

fi

echo "End   procedure on: " `date` >>$LOGFILE
exit 0

